import { route } from "../src/decorators/route";
import { router } from "../src/decorators/router";
import { MetaRouter } from "../src/MetaRouter";

describe("MetaRouter", () => {
  it("should create router metadata", () => {

    @router("/toto")
    class MyRouter {
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
          middlewares: [],
          path: "/tata",
        },
      },
      target: {
        prefix: "/toto",
      },
    });
  });
});
