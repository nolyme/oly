import { Kernel } from "oly";
import { INode, IRoute } from "../../src/router/interfaces";
import { ReactRouterMatcher } from "../../src/router/services/ReactRouterMatcher";

describe("ReactRouterMatcher", () => {

  const node = (name: string, path: string, op: Partial<INode> = {}): INode => ({
    name,
    path,
    ...op,
    target: Invokable,
    propertyKey: "count",
  });

  class Invokable {
    static count = 0;

    count() {
      Invokable.count += 1;
    }
  }

  const nodes = [
    node("root", "", {abstract: true}),
    node("home", "/", {parent: "root"}),
    node("about", "/about", {parent: "root"}),
    node("users", "/users", {abstract: true, parent: "root"}),
    node("list", "/list", {parent: "users"}),
    node("byId", "/:userId", {parent: "users"}),
    node("articles", "/articles", {abstract: true, parent: "root"}),
    node("byId", "/:articleId", {parent: "articles"}),
    node("404", "/*", {parent: "root"}),
  ];

  const matcher = Kernel.create().inject(ReactRouterMatcher);
  const routes = matcher.createRoutes(nodes);
  const notAbstract = (r: IRoute) => !r.abstract;

  describe("#createRoutes", () => {
    it("should create routes", () => {
      expect(routes.filter(notAbstract).map((r) => r.path)).toEqual([
        "/",
        "/about",
        "/users/list",
        "/users/:userId",
        "/articles/:articleId",
        "/*",
      ]);
      expect(routes.filter(notAbstract).map((r) => r.name)).toEqual([
        "root.home",
        "root.about",
        "root.users.list",
        "root.users.byId",
        "root.articles.byId",
        "root.404",
      ]);
    });
  });
  describe("#href()", () => {
    it("should avoid conflict", () => {
      // userId is always before articleId (size)
      expect(matcher.href(routes, "byId")).toBe("/users/:userId");
      expect(matcher.href(routes, "articles.byId")).toBe("/articles/:articleId");
      expect(matcher.href(routes, "root.articles.byId")).toBe("/articles/:articleId");
      expect(matcher.href(routes, "/articles/:articleId")).toBe("/articles/:articleId");
      expect(matcher.href(routes, "users.byId")).toBe("/users/:userId");
      expect(matcher.href(routes, "/users/:userId")).toBe("/users/:userId");
    });
    it("should fill when possible", () => {
      expect(matcher.href(routes, {to: "users.byId", params: {userId: 1}})).toBe("/users/1");
      expect(matcher.href(routes, {to: "/users/:userId", params: {userId: 1}})).toBe("/users/1");
      expect(matcher.href(routes, {to: "/users/:userId", params: {userId: 1}, query: {refresh: "true"}}))
        .toBe("/users/1?refresh=true");
    });
  });
});
