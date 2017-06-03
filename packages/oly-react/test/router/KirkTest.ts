import { attachKernel } from "oly-test";
import { INode } from "../../src/router/interfaces";
import { Kirk } from "../../src/router/services/Kirk";

describe("Kirk", () => {

  class Invokable {
    static count = 0;

    count() {
      Invokable.count += 1;
    }
  }

  const route = (name: string, path: string, op: Partial<INode> = {}): INode => ({
    name,
    path,
    ...op,
    target: Invokable,
    propertyKey: "count",
  });
  const kirk = attachKernel().get(Kirk);
  const routes = kirk.createRoutes([
    route("404", "/*"),
    route("byId", "/:id", {parent: "users"}),
    route("about", "/about"),
    route("users", "/users", {abstract: true}),
    route("home", "/"),
  ]);

  describe("#createRoutes", () => {
    it("should create routes", () => {
      expect(routes.filter((r) => !r.abstract).map((r) => r.path)).toEqual([
        "/", "/about", "/users/:id", "/*",
      ]);
      expect(routes.filter((r) => !r.abstract).map((r) => r.name)).toEqual([
        "home", "about", "users.byId", "404",
      ]);
    });
  });
});
