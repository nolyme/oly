import { ApiProvider, body, get } from "oly-api";
import { Kernel, Meta } from "oly-core";
import { HttpClient } from "oly-http";
import { field } from "oly-json";
import { olyRouterKeys } from "oly-router";
import { api } from "../src/decorators/api";
import { ISwaggerSpec } from "../src/interfaces";
import { SwaggerProvider } from "../src/providers/SwaggerProvider";

describe("SwaggerProvider", () => {

  const auth = (...roles: string[]) => (target: object, propertyKey: string) => {
    Meta.of({key: olyRouterKeys.router, target, propertyKey}).set({
      roles,
    });
  };

  class Data {
    @field tata: string;
  }

  class Ctrl {
    @auth("ADMIN")
    @get("/")
    @api({
      description: "Toto",
    })
    index(@body body: Data) {
      return {ok: true};
    }
  }

  const kernel = Kernel.create({
    HTTP_SERVER_PORT: 6331,
  }).with(Ctrl, SwaggerProvider);
  const server = kernel.inject(ApiProvider);
  const client = kernel.inject(HttpClient).with({baseURL: server.hostname});

  describe("#onStart()", () => {
    it("should provide spec", async () => {
      const data = await client.get<ISwaggerSpec>("/swagger.json");
      expect(data.swagger).toBe("2.0");
      expect(data.securityDefinitions.Bearer.in).toBe("header");
      expect(data.paths["/"].get.description).toBe("Toto");
      expect(data.paths["/"].get.parameters[0].name).toBe("Data");
      expect(data.definitions.Data.properties.tata.type).toBe("string");
    });
    it("should provide ui", async () => {
      const data = await client.get<any>("/swagger/ui");
      expect(typeof data).toBe("string");
      expect(data.indexOf("html")).not.toBe(-1);
    });
  });
});
