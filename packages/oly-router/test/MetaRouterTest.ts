import { route } from "../src/decorators/route";
import { MetaRouter } from "../src/MetaRouter";

describe("MetaRouter", () => {
  it("should create router metadata", () => {

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
      target: {},
    });
  });
});
