import { equal } from "assert";
import { _ } from "../../src";
import { olyCoreErrors } from "../../src/kernel/constants/errors";
import { env } from "../../src/kernel/decorators/env";
import { inject } from "../../src/kernel/decorators/inject";
import { injectable } from "../../src/kernel/decorators/injectable";
import { on } from "../../src/kernel/decorators/on";
import { state } from "../../src/kernel/decorators/state";
import { KernelException } from "../../src/kernel/exceptions/KernelException";
import { Kernel } from "../../src/kernel/Kernel";
import { Logger } from "../../src/logger/Logger";
import { ServerLogger } from "../../src/logger/ServerLogger";

const createKernel = (o: any = {}): Kernel => {
  return Kernel.create({LOGGER_LEVEL: "ERROR", ...o});
};

describe("Kernel", () => {

  describe("#get()", () => {

    it("should inject A", () => {

      class A {
        b = "c";
      }

      const kernel = createKernel();
      const a = kernel.inject(A, {register: false});

      expect(a.b).toBe("c");
    });

    it("should inject kernel", () => {

      class A {
        @inject kernel: Kernel;
      }

      const kernel = createKernel({A: "B"});
      const a = kernel.inject(A, {register: false});

      expect(a.kernel.env("KERNEL_ID")).toBe(kernel.env("KERNEL_ID"));
      expect(a.kernel.state("A")).toBe("B");
    });

    it("should reject when null", async () => {
      const A: any = null;
      expect(() => createKernel().with(A))
        .toThrow(olyCoreErrors.injectableIsNull());
    });

    it("should reject when null 2", async () => {
      const A: any = null;
      expect(() => createKernel().inject({provide: A, use: A}))
        .toThrow(olyCoreErrors.isNotFunction("provide", typeof A));
    });

    it("should write metadata on child", async () => {

      class Parent {
        @env("A") a: string = "a";
      }

      @injectable({
        provide: Parent,
      })
      class Child extends Parent {
        @env("B") b: string;
      }

      expect(createKernel().inject(Parent).a).toBe("a");
      expect(() => createKernel().inject(Child).a).toThrow(olyCoreErrors.envNotDefined("B"));
    });

    it("should auto inject", async () => {

      class B {
        c = "d";
      }

      @injectable
      class A {
        constructor(@state("X")
                    public x: string,
                    public b: B) {
        }
      }

      const k = createKernel({X: "Y"});
      expect(k.inject(A).b.c).toBe("d");
      expect(k.inject(A).x).toBe("Y");
    });

    it("should swap 'provide' with 'use'", () => {
      class B {
        c = "C";
      }

      class BMock {
        c = "MOCK";
      }

      class A {
        @inject b: B;
      }

      const kernel = createKernel().with({provide: B, use: BMock}, A);
      expect(kernel.inject(A).b.c).toBe("MOCK");
    });

    it("should reject swap of B if B is already defined after start", async () => {
      class B {
        c = "C";
      }

      class BMock {
        c = "MOCK";
      }

      class A {
        @inject b: B;
      }

      expect(createKernel().inject(A).b.c).toBe("C");
      expect(createKernel().with(A).with({provide: B, use: BMock}).inject(A).b.c).toBe("MOCK");
      await expect(createKernel().with(A).start().then((k) => k.with({provide: B, use: BMock})))
        .rejects.toEqual(new KernelException(olyCoreErrors.noDepUpdate("B")));
    });

    it("should register swapping with identity", () => {

      class A {
        b = "c";
      }

      class A2 {
        b = "d";
      }

      const kernel = createKernel();

      // define A2 as A then return A2
      const a = kernel.inject({provide: A, use: A2});
      equal(a.b, "d");
      a.b = "e";

      // A2 is shared with A as A2 !
      equal(kernel.inject(A2).b, "e");

      // you can break the rule with lambda
      const k2 = createKernel();
      const a2 = k2.inject({provide: A, use: (k) => k.inject(A2, {register: false})}); // this is allowed

      // but now, 'use' cannot be a research criteria
      equal(a2.b, "d");
      a2.b = "e";
      equal(k2.inject(A2).b, "d");
    });

    it("should respect explicit swapping", async () => {

      const stack: string[] = [];

      class A {
        b = () => "c";
      }

      class A2 extends A {
        b = () => "d";
      }

      class A3 extends A2 {
        b = () => "e";
      }

      @injectable({
        provide: A,
      })
      class A4 extends A2 {
        b = () => "f";
      }

      class A5 extends A4 {
        b = () => "g";
      }

      @injectable({
        provide: A4,
      })
      class A6 extends A4 {
        b = () => "h";
      }

      class B {
        @inject a: A;

        onStart() {
          stack.push(this.a.b());
        }
      }

      await createKernel().with({provide: A, use: A3}, B).start();
      await createKernel().with(A3, B).start();
      await createKernel().with(B).start();
      await createKernel().with(A4, B).start();

      // as we extend without redecorate, the provide-forcing is not kept :), this will returns A
      await createKernel().with(A5, B).start();

      // whereas with manual providing, this will returns A5
      await createKernel().with({provide: A, use: A5}, B).start();

      // if you provide A4 with A5, A5 will swap A4 BUT A4 is provide-force to A so B will have A5 !!!!
      await createKernel().with({provide: A4, use: A5}, B).start();

      // recursively, A6 -> A4 -> A
      await createKernel().with(A6, B).start();

      equal(stack.join(""), "eccfcggh");
    });

    it("removes unused declarations after a late-swapping", async () => {

      class C {
        onStart() {
          throw new Error("This is't excepted");
        }
      }

      class B {
        @inject c: C;
        d = "e";
      }

      class B2 {
        d = "f";
      }

      class A {
        @inject b: B;
      }

      const k = await createKernel()
        .with(A) // first declaration will add A, B and C
        .with({provide: B, use: B2})
        .start();

      expect(k.inject(A).b.d).toBe("f");
    });
    it("should use parent", () => {
      class A {
        b = "c";
      }

      class E {
        @inject a: A;
      }

      class E2 extends E {
      }

      expect(createKernel().inject(E2).a.b).toBe("c");
    });
  });

  describe("#start()", () => {

    it("should trigger onStart() of deps", async () => {

      let stack = "";

      class A {
        onStart() {
          stack += "A";
        }
      }

      class B {
        @inject a: A;
      }

      await createKernel().with(B).start();

      expect(stack).toBe("A");
    });

    it("should accept A as Service although #start()", async () => {

      class A {
        b = "c"; // 0 impact
      }

      const k = createKernel();
      await k.start();

      expect(k.inject(A).b).toBe("c");
    });

    it("should reject A as IProvider after #start()", async () => {

      class A {
        b = "c";

        onStart() {
          // define onStart = provider = no dynamic injection of provider after onStart
        }
      }

      const k = createKernel();
      await k.start();

      expect(() => k.inject(A))
        .toThrow(olyCoreErrors.noDepAfterStart("A"));
    });

    it("should accept #start() again after #stop()", async () => {
      const k = createKernel();
      await k.start();
      await k.stop();
      await k.start();
    });

    it("should #stop() each started when #start() fails", async () => {

      class A {
        state = 0;

        onStart() {
          this.state = 1;
        }

        onStop() {
          this.state = 2;
        }
      }

      class B {
        @inject a: A;

        onStart() {
          throw new Error("Oops");
        }
      }

      const k = createKernel().with(B);
      expect(k.inject(A).state).toBe(0);

      try {
        await k.start();
        fail("!");
      } catch (e) {
        expect(e.message).toBe("Oops");
      }

      expect(k.inject(A).state).toBe(2);
    });

    it("should respect all cascading priorities", async () => {

      const stack: string[] = [];

      class A {
        onConfigure = () => stack.push("->");
        onStart = () => stack.push("A");
        onStop = () => stack.push("H");
      }

      class B {
        @inject a: A;
        onStart = () => stack.push("B");
      }

      class C {
        @inject a: A;
        onStart = () => stack.push("C");
      }

      class D {
        @inject b: B;
        @inject c: C;
        onStart = () => stack.push("D");
      }

      class E {
        @inject d: D;
        @inject c: D;
        onStart = () => stack.push("E");
      }

      class F {
        @inject e: E;
        @inject a: A;
        onStart = () => stack.push("F");
        onStop = () => stack.push("G");
      }

      await createKernel().with(F).start().then((k) => k.stop());

      expect(stack.join("")).toBe("->ABCDEFGH");
    });

    it("should handle error", async () => {

      const error = "Fail";

      class A {
        onStart() {
          throw new Error(error);
        }
      }

      await expect(createKernel().with(A).start())
        .rejects
        .toEqual(new Error(error));
    });
  });

  describe("#state()", () => {

    it("should cast only if it's possible and asked", () => {

      class A {
        @state() data = "SECRET";
        @env("data2") data2: string;
        @env("data3") data3: number;

        getEnv = () => this.data2;
      }

      const kernel = createKernel({
        data2: "1",
        data3: "1",
      });
      expect(kernel.with(A).state(_.identity(A, "data"))).toBe("SECRET");
      expect(kernel.inject(A).getEnv()).toBe("1");
    });

    it("should parse boolean", () => {
      expect(createKernel({ok: "true"}).env("ok", Boolean)).toBe(true);
      expect(createKernel({ok: "true"}).state("ok")).toBe("true");
      expect(createKernel({ok: "false"}).env("ok", Boolean)).toBe(false);
      expect(createKernel({ok: "false"}).state("ok")).toBe("false");
    });

    it("should parse number", () => {
      expect(createKernel({port: "8080"}).env("port", Number)).toBe(8080);
      expect(createKernel({port: "8080"}).state("port")).toBe("8080");
    });

    it("should define a name to anonymous states", () => {

      class A {
        @state("X") x = "y";
        @state() w = "z";
        @state m = "1";
      }

      const k = createKernel().with(A);
      expect(k.state("X")).toBe("y");
      expect(k.state("Y")).toBeUndefined();
      expect(k.state(_.identity(A, "w"))).toBe("z");
      expect(k.state(_.identity(A, "m"))).toBe("1");
      expect(k.env(_.identity(A, "m"), Number)).toBe(1);
    });

    it("should reject undefined readonly state", async () => {

      class A {
        @env("x") x: string;
      }

      expect(() => createKernel().with(A))
        .toThrow(olyCoreErrors.envNotDefined("x"));
    });

    it("should accept undefined as new value", async () => {

      const k = createKernel({A: "B"});
      expect(k.state("A")).toBe("B");
      k.state("A", undefined);
      expect(k.state("A")).toBeUndefined();
    });

    it("should override state processing", async () => {

      class C {
      }

      class A {
        @inject c: C;
        @state("B") b: string;
        @env("D") d: string;
      }

      const kernel = createKernel({B: "B", D: "D"});
      // without "configuration:true", we should get an error "Cannot redefine property" blahblahblah..
      // problem is only for @state
      kernel.with({provide: A, use: (k) => k.inject(A, {register: false})});
    });
  });

  describe("#env()", () => {

    it("should return the correct value", () => {
      const kernel = createKernel({HELLO: "WORLD"});
      expect(kernel.env("HELLO")).toBe("WORLD");
      expect(kernel.env("HELLO2")).toBeUndefined();
    });

    it("should return 'undefined' when not defined", () => {
      const kernel = createKernel();
      expect(kernel.env("HELLO")).toBe(undefined);
    });

    it("should cast env as number", () => {
      const kernel = createKernel({A: "1"});
      expect(kernel.env("A", Number)).toBe(1);
    });

    it("should template values", () => {
      const kernel = createKernel({A: "B", C: "${A}"});
      expect(kernel.env("C")).toBe("B");
    });
  });

  describe("#fork()", () => {

    class A {
      data = "a";
    }

    class B {
      @state data = "a";
    }

    it("should create new context", () => {
      const kernel = new Kernel().with(A, B);
      equal(kernel.inject(A).data, "a");
      kernel.inject(A).data = "b";
      equal(kernel.inject(A).data, "b");
      const child = kernel.fork();
      equal(child.inject(A).data, "a");
      equal(kernel.inject(A).data, "b");
    });

    it("should keep parent state", () => {
      const kernel = new Kernel().with(A, B);
      equal(kernel.inject(B).data, "a");
      kernel.inject(B).data = "b";
      equal(kernel.inject(B).data, "b");
      const child = kernel.fork();
      equal(child.inject(B).data, "b");
      equal(kernel.inject(B).data, "b");
    });

    it("should mutate parent state", () => {
      const kernel = new Kernel().with(A, B);
      kernel.inject(B).data = "b";
      const child = kernel.fork();
      child.inject(B).data = "c";
      equal(child.inject(B).data, "c");
      equal(kernel.inject(B).data, "c");
    });

    it("should mutate his own state", () => {
      class C {
        @state data: string;
      }

      const parent = new Kernel().with(C);
      const child = parent.fork();
      child.inject(C).data = "c";
      equal(child.inject(C).data, "c");
      equal(parent.inject(C).data, undefined);
    });

    it("should keep parent env", () => {

      class C {
        @env("D") d = "e";
      }

      const kernel = new Kernel({D: "f"}).with(C);
      equal(kernel.state("D"), "f");
      equal(kernel["store"]["D"], "f"); // tslint:disable-line
      const child = kernel.fork();
      equal(child.state("D"), "f");
      equal(child["store"]["D"], undefined); // tslint:disable-line
    });

    it("should init state once", () => {
      class A33 {
        @state()
        b = "c";
      }

      const kernel = createKernel();
      const a = kernel.inject(A33);
      expect(a.b).toBe("c");
      a.b = "d";
      expect(a.b).toBe("d");
      expect(kernel.state(_.identity(A33, "b"))).toBe(a.b);
      const child = kernel.fork();
      const a2 = child.inject(A33);
      expect(a2.b).toBe("d");
      expect(a.b).toBe(a2.b);
      expect(kernel.state(_.identity(A33, "b"))).toBe(a.b);
      expect(child.state(_.identity(A33, "b"))).toBe(a.b);
    });

    it("should keep :use", () => {
      const k = createKernel();
      expect(k.get(Logger).constructor).toBe(ServerLogger);
      const k2 = k.fork();
      expect(k2.get(Logger).constructor).toBe(ServerLogger);
    });
  });

  describe("#emit()", () => {

    it("should wait event", async () => {
      const k = createKernel();
      _.timeout(10).then((v) => k.emit("test:lol", {OK: true}));
      expect(await k.on("test:lol").wait())
        .toEqual({OK: true});
    });

    it("should process event", async () => {

      class App {
        @state("counter") counter = 0;

        @on("inc")
        inc() {
          this.counter += 1;
        }
      }

      const kernel = createKernel().with(App);

      for (let i = 0; i < 6; i++) {
        await kernel.emit("inc");
      }
      expect(kernel.state("counter")).toBe(6);

      await kernel.fork().emit("inc");
      expect(kernel.state("counter")).toBe(6);

      (kernel.inject(App) as any).__free__();
      await kernel.emit("inc");
      expect(kernel.state("counter")).toBe(6);
    });

    it("should clean event", async () => {

      let i = 0;
      const k = createKernel();
      const func = () => i++;
      const obs = k.on("a", func);
      k.on("a", func, {unique: true});
      await k.emit("a");
      await k.emit("a");
      expect(i).toBe(3);
      obs.free();
      await k.emit("a");
      expect(i).toBe(3);
    });

    it("should catch error", async () => {
      const k = createKernel();
      k.on("test", () => {
        throw new Error("OK");
      });
      expect(await k.emit("test")).toEqual([new Error("OK")]);
    });

    it("should fork kernel with events", async () => {

      class A {
        @inject k: Kernel;

        @on
        b() {
          return this.k.id;
        }
      }

      const kernel = createKernel().with(A);
      const [id] = await kernel.emit(_.identity(A, "b"), null, {fork: true});
      expect(id.length).toBe(25); // 12 + 1 + 12
    });
  });

  describe("#invoke()", () => {
    it("should create arguments", () => {

      class A {
        b = "c";
      }

      class B {
        e: string;

        constructor(@state("F") public a: string) {
        }

        c(@inject() a: A) {
          this.e = a.b;
          return this.e;
        }
      }

      const k = createKernel({F: "G"});
      const b = k.inject(B);
      expect(b.a).toBe("G");
      expect(b.e).toBeUndefined();
      k.invoke(B, "c");
      expect(b.e).toBe("c");
      expect(k.invoke(new B("0"), "c")).toBe("c");
    });
    it("should have additionalArguments", () => {
      class A {
        b: string;

        c(d: string) {
          this.b = d;
        }
      }

      const k = createKernel();
      const a = k.inject(A);
      expect(a.b).toBeUndefined();
      k.invoke(A, "c", ["e"]);
      expect(a.b).toBe("e");
    });
  });
});
