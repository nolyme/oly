import { Kernel, Meta } from "oly";
import { HttpClient } from "oly-http";
import { field } from "oly-json";
import { olyApiKeys } from "../src/core/constants/keys";
import { body } from "../src/core/decorators/body";
import { get } from "../src/core/decorators/get";
import { ApiProvider } from "../src/core/providers/ApiProvider";
import { api } from "../src/swagger/decorators/api";
import { ISwaggerSpec } from "../src/swagger/interfaces";
import { SwaggerProvider } from "../src/swagger/providers/SwaggerProvider";

describe("SwaggerProvider", () => {

  const auth = (...roles: string[]) => (target: object, propertyKey: string) => {
    Meta.of({key: olyApiKeys.router, target, propertyKey}).set({
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
    index(@body() data: Data) {
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
