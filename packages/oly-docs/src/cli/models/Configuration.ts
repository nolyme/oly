import { array, field } from "oly-json";
import { ModuleConfiguration } from "./ModuleConfiguration";

export class Configuration {

  @array({
    of: ModuleConfiguration,
  })
  public modules: ModuleConfiguration[];
}
