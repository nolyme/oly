import { ApiProvider, get } from "oly-api";
import { Kernel } from "oly-core";
import { HttpClient } from "oly-http";
import { use } from "oly-router";
import { api } from "../src/decorators/api";
import { ISwaggerSpec } from "../src/interfaces";
import { SwaggerProvider } from "../src/providers/SwaggerProvider";

const toto = () =>
  function hasRoleMiddleware(ctx: any, next: any) {
    return next();
  };

class Ctrl {
  @use(toto())
  @get("/")
  @api({
    description: "Toto",
  })
  index() {
    return {ok: true};
  }
}

describe("SwaggerProvider", () => {

  const kernel = Kernel.create({
    HTTP_SERVER_PORT: 6833,
  }).with(Ctrl, SwaggerProvider);
  const server = kernel.inject(ApiProvider);
  const client = kernel.inject(HttpClient).with({baseURL: server.hostname});

  describe("#onStart()", () => {
    it("should provide spec", async () => {
      const {data} = await client.get<ISwaggerSpec>("/swagger.json");
      expect(data.swagger).toBe("2.0");
      expect(data.securityDefinitions.Bearer.in).toBe("header");
      expect(data.paths["/"].get.description).toBe("Toto");
    });
    it("should provide ui", async () => {
      const {data} = await client.get<any>("/swagger/ui");
      expect(typeof data).toBe("string");
      expect(data.indexOf("html")).not.toBe(-1);
    });
  });
});
