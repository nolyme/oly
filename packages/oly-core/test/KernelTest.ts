import { deepEqual, equal } from "assert";
import { _ } from "../src";
import { olyCoreErrors } from "../src/constants/errors";
import { env } from "../src/decorators/env";
import { inject } from "../src/decorators/inject";
import { injectable } from "../src/decorators/injectable";
import { on } from "../src/decorators/on";
import { state } from "../src/decorators/state";
import { Kernel } from "../src/Kernel";

const createKernel = (options: object = {}) => {
  return Kernel.create(_.assign({}, {OLY_LOGGER_LEVEL: "ERROR"}, options, process.env));
};

describe("Kernel", () => {
  describe("#inject()", () => {
    it("should inject A", () => {

      class A {
        b = "c";
      }

      const kernel = createKernel();
      const a = kernel.get(A, {register: false});

      equal(a.b, "c");
    });
    it("should inject kernel", () => {

      class A {
        @inject kernel: Kernel;
      }

      const kernel = createKernel({A: "B"});
      const a = kernel.get(A, {register: false});

      equal(a.kernel.id, kernel.id);
      equal(a.kernel.state("A"), "B");
    });
    it("should reject when null", async () => {
      const A: any = null;
      expect(() => createKernel().with(A))
        .toThrow(olyCoreErrors.injectableIsNull());
    });
    it("should reject when null 2", async () => {
      const A: any = null;
      expect(() => createKernel().get({provide: A, use: A}))
        .toThrow(olyCoreErrors.isNotFunction("provide", typeof A));
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

      equal(stack, "A");
    });

    it("should accept A as Service although #start()", async () => {

      class A {
        b = "c"; // 0 impact
      }

      const k = createKernel();
      await k.start();

      equal(k.get(A).b, "c");
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

      expect(() => k.get(A))
        .toThrow(olyCoreErrors.noDepAfterStart("A"));
    });

    it("should reject #start() after #start()", async () => {
      const k = createKernel();
      await k.start();
      expect(() => k.start()).toThrow(olyCoreErrors.alreadyStarted());
    });

    it("should reject #stop() before #start()", async () => {
      const k = createKernel();
      expect(() => k.stop()).toThrow(olyCoreErrors.notStarted());
    });

    it("should accept #start() again after #stop()", async () => {
      const k = createKernel();
      await k.start();
      await k.stop();
      await k.start();
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

      // cyclic dep isn't allowed as typescript can't handle direct inject
      // you should pass by <{ @inject(() => MyClass) a: A }> but it's not a good idea
      // if you really want a circular injection, you need to pass by the kernel with Kernel#get()

      await createKernel().with(F).start().then((k) => k.stop());

      equal(stack.join(""), "->ABCDEFGH");
    });
    it("should handle error", async () => {

      const error = "Fail";

      class A {
        onStart() {
          throw new Error(error);
        }
      }

      (expect(createKernel().with(A).start()) as any).rejects.toEqual(new Error(error));
    });
  });
  describe("#env()", () => {

    it("should return the correct value", () => {

      const kernel = createKernel({HELLO: "WORLD"});
      equal(kernel.env("HELLO"), "WORLD");
      equal(kernel.env("HELLO2"), null);
    });

    it("should return 'undefined' when not defined", () => {
      const kernel = createKernel();
      equal(kernel.env("HELLO"), undefined);
    });

    it("should cast env as number", () => {
      const kernel = createKernel({A: "1"});
      equal(kernel.env("A"), 1);
    });

    it("should template values", () => {
      const kernel = createKernel({A: "B", C: "${A}"});
      equal(kernel.env("C"), "B");
    });
  });
  describe("#state()", () => {

    it("should return the correct value", () => {

      class A {
        @state() data = "SECRET";
      }

      equal(createKernel().with(A).state(_.targetToString(A, "data")), "SECRET");
    });

    it("should use NODE_ENV", () => {
      process.env.NODE_ENV = "production";
      equal(createKernel().isProduction(), true);
      process.env.NODE_ENV = "test";
      equal(createKernel().isProduction(), false);
    });

    it("should parse boolean", () => {
      equal(createKernel({ok: "true"}).env("ok"), true);
      equal(createKernel({ok: "true"}).state("ok"), "true");
      equal(createKernel({ok: "false"}).env("ok"), false);
      equal(createKernel({ok: "false"}).state("ok"), "false");
    });

    it("should parse number", () => {
      expect(createKernel({port: "8080"}).env("port")).toBe(8080);
      expect(createKernel({port: "8080"}).state("port")).toBe("8080");
    });

    it("should define a name to anonymous states", () => {

      class A {
        @state("X") x = "y";
        @state() w = "z";
        @state m = "1";
      }

      const k = createKernel().with(A);
      equal(k.state("X"), "y");
      equal(k.state("Y"), null);
      equal(k.state(_.targetToString(A, "w")), "z");
      equal(k.state(_.targetToString(A, "m")), "1");
      equal(k.env(_.targetToString(A, "m")), 1);
    });

    it("should reject undefined readonly state", async () => {

      class A {
        @env("x") x: string;
      }

      expect(() => createKernel().with(A))
        .toThrow(olyCoreErrors.envNotDefined("x"));
    });
  });
  describe("#fork()", () => {

    class A {
      data = "a";
    }

    class B {
      @state() data = "a";
    }

    it("should create new context", () => {
      const kernel = new Kernel().with(A, B);
      equal(kernel.get(A).data, "a");
      kernel.get(A).data = "b";
      equal(kernel.get(A).data, "b");
      const child = kernel.fork();
      equal(child.get(A).data, "a");
      equal(kernel.get(A).data, "b");
    });

    it("should keep parent state", () => {
      const kernel = new Kernel().with(A, B);
      equal(kernel.get(B).data, "a");
      kernel.get(B).data = "b";
      equal(kernel.get(B).data, "b");
      const child = kernel.fork();
      equal(child.get(B).data, "b");
      equal(kernel.get(B).data, "b");
    });

    it("should mutate parent state", () => {
      const kernel = new Kernel().with(A, B);
      kernel.get(B).data = "b";
      const child = kernel.fork();
      child.get(B).data = "c";
      equal(child.get(B).data, "c");
      equal(kernel.get(B).data, "c");
    });

    it("should mutate his own state", () => {
      class C {
        @state() data: string;
      }

      const parent = new Kernel().with(C);
      const child = parent.fork();
      child.get(C).data = "c";
      equal(child.get(C).data, "c");
      equal(parent.get(C).data, undefined);
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
      class A {
        @state()
        b = "c";
      }

      const kernel = createKernel();
      const a = kernel.get(A);
      expect(a.b).toBe("c");
      a.b = "d";
      expect(a.b).toBe("d");
      expect(kernel.state(_.targetToString(A, "b"))).toBe(a.b);
      const child = kernel.fork();
      const a2 = child.get(A);
      expect(a2.b).toBe("d");
      expect(a.b).toBe(a2.b);
      expect(kernel.state(_.targetToString(A, "b"))).toBe(a.b);
      expect(child.state(_.targetToString(A, "b"))).toBe(a.b);
    });
  });

  describe("extends", () => {
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

      expect(createKernel().get(Parent).a).toBe("a");
      expect(() => createKernel().get(Child).a).toThrow(olyCoreErrors.envNotDefined("B"));
    });
  });

  describe("#swap()", () => {

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
      equal(kernel.get(A).b.c, "MOCK");
    });

    it("should reject swap of B if B is already defined", () => {
      class B {
        c = "C";
      }

      class BMock {
        c = "MOCK";
      }

      class A {
        @inject b: B;
      }

      expect(() => createKernel().with(A).with({provide: B, use: BMock}))
        .toThrow(olyCoreErrors.noDepUpdate("B"));
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
      const a = kernel.get({provide: A, use: A2});
      equal(a.b, "d");
      a.b = "e";

      // A2 is shared with A as A2 !
      equal(kernel.get(A2).b, "e");

      // you can break the rule with lambda
      const k2 = createKernel();
      const a2 = k2.get({provide: A, use: (k) => k.get(A2, {register: false})}); // this is allowed

      // but now, 'use' cannot be a research criteria
      equal(a2.b, "d");
      a2.b = "e";
      equal(k2.get(A2).b, "d");
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
  });

  describe("#emit()", () => {

    it("should wait event", async () => {
      const k = new Kernel();
      _.timeout(10).then((_) => k.emit("test:lol", {OK: true}));
      deepEqual(await k.on("test:lol", _.noop).wait(), {OK: true});
    });

    it("should process event", () => {
      class App {
        @state("counter") counter = 0;

        @on("inc")
        inc() {
          this.counter += 1;
        }
      }

      const kernel = Kernel.create().with(App);

      for (let i = 0; i < 6; i++) {
        kernel.emit("inc");
      }
      expect(kernel.state("counter")).toBe(6);

      kernel.fork().emit("inc");
      expect(kernel.state("counter")).toBe(6);

      (kernel.get(App) as any).__free__();
      kernel.emit("inc");
      expect(kernel.state("counter")).toBe(6);
    });

    it("should clean event", () => {

      let i = 0;
      const k = createKernel();
      const func = () => i++;
      const obs = k.on("a", func);
      k.on("a", func, {unique: true});
      k.emit("a");
      k.emit("a");
      expect(i).toBe(3);
      obs.free();
      k.emit("a");
      expect(i).toBe(3);
    });

    it("should catch error", async () => {
      const k = createKernel();
      k.on("test", () => {
        throw new Error("OK");
      });
      expect(await k.emit("test")).toEqual([new Error("OK")]);
    });

    it("should notify parent", async () => {
      let inc = 0;
      const parent = createKernel();
      parent.on("test", () => inc += 1);
      const child = parent.fork();
      await child.emit("test");
      await child.emit("test", null, {parent: true});
      await child.emit("test");
      expect(inc).toBe(1);
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
      const [id] = await kernel.emit(_.targetToString(A, "b"), null, {fork: true});
      expect(id.length).toBe(25); // 12 + 1 + 12
    });
  });
});
