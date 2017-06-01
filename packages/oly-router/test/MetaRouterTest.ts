import { _ } from "oly-core";
import { route } from "../src/decorators/route";
import { router } from "../src/decorators/router";
import { use } from "../src/decorators/use";
import { MetaRouter } from "../src/MetaRouter";

describe("MetaRouter", () => {
  it("should create router metadata", () => {

    @use(_.noop)
    @router("/toto")
    class MyRouter {

      @use(_.noop)
      @route({method: "POST", path: "/tata"})
      public a() {
        return null;
      }
    }

    const routerMetadata = MetaRouter.get(MyRouter);
    expect(routerMetadata).toEqual({
      args: {},
      properties: {
        a: {
          api: {},
          method: "POST",
          middlewares: [_.noop],
          path: "/tata",
        },
      },
      target: {
        middlewares: [_.noop],
        prefix: "/toto",
      },
    });
  });
});
