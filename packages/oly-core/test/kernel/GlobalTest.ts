import { deepEqual, equal } from "assert";
import { _ } from "../../src/kernel/Global";

describe("Global", () => {
  describe(".shortid()", () => {
    it("should generate random 12 chars", () => {
      equal(_.shortid().length, 12);
    });
    it("should generate random 8 chars", () => {
      equal(_.shortid(8).length, 8);
    });
    it("should generate random 20 chars", () => {
      equal(_.shortid(18).length, 18);
    });
  });
  describe(".timeout()", () => {
    it("should sleep ~20ms (delta: 10ms)", async () => {
      const before = Date.now();
      await _.timeout(20);
      const now = Date.now() - before;
      equal(now > 10, true);
    });
  });
  describe(".isEqualClass()", () => {
    const f1 = () => class Abc {
      toto() {
        return 0;
      }
    };
    const f2 = () => class Abc {
      toto() {
        return 0;
      }
    };
    it("should accept classes", () => {
      expect(_.isEqualClass(f1(), f1())).toBeTruthy();
    });
    it("should accept classes with != ref", () => {
      expect(_.isEqualClass(f1(), f2())).toBeTruthy();
    });
  });
  describe(".cascade()", () => {
    it("should always chain one by one promises", async () => {
      const stack: string[] = [];
      const tasks = [
        () => new Promise((r) => r(stack.push("A"))),
        () => new Promise((r) => r(stack.push("B"))),
        () => new Promise((r) => r(stack.push("C"))),
        () => new Promise((r) => r(stack.push("D"))),
      ];
      await _.cascade(tasks);
      equal(stack.join(""), "ABCD");
    });
  });
  describe(".bubble()", () => {
    it("should bubble sort array", () => {
      const deps = [0, 1, 4, 19, 120, 3, 5, 0, 1];
      const cmp = (target: number[], i: number) => !!target[i + 1] && target[i] < target[i + 1];
      deepEqual(_.bubble(deps, cmp), [0, 0, 1, 1, 3, 4, 5, 19, 120].reverse());
    });
  });
  describe(".template()", () => {
    it("should inject name", () => {
      expect(_.template("Hello ${name}", {name: "World"})).toBe("Hello World");
      expect(_.template("Hello ${name}", {})).toBe("Hello ${name}");
      expect(_.template("${/\\-._}", {"/\\-._": "OK"})).toBe("OK");
      expect(_.template("${A}${A}${A}", {A: "B"})).toBe("BBB");
    });
  });
});
