import { arg } from "../src";
import { route } from "../src/decorators/route";
import { router } from "../src/decorators/router";
import { RouterMetadataUtil } from "../src/utils/RouterMetadataUtil";

describe("RouterMetadataUtil", () => {
  it("should create router metadata", () => {

    @router("/")
    class MyRouter {
      @route("GET", "/")
      public a(@arg("body") body: string) {
        return null;
      }
    }

    const routerMetadata = RouterMetadataUtil.getRouter(MyRouter);
    expect(RouterMetadataUtil.hasRouter(MyRouter)).toBeTruthy();
    expect(routerMetadata).toEqual({
      prefix: "/",
      routes: {
        a: {
          args: {0: "body"},
          method: "GET",
          middlewares: [],
          path: "/",
        },
      },
    });
  });
});
