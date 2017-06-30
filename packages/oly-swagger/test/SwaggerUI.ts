import { Kernel } from "oly-core";
import { body } from "oly-api";
import { get } from "oly-api";
import { ApiProvider } from "oly-api";
import { field } from "oly-json";
import { api } from "../src/decorators/api";
import { SwaggerProvider } from "../src/providers/SwaggerProvider";

const k = Kernel.create();

class Data {
  @field tata: string;
}

class Ctrl {
  @get("/")
  @api({
    description: "Toto",
  })
  index(@body body: Data) {
    return {ok: true};
  }
}

k.with(SwaggerProvider, ApiProvider, Ctrl).start().catch(console.error);