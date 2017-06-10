import { array, field } from "oly-json";
import { ModuleConfiguration } from "./ModuleConfiguration";

export class Configuration {

  @field
  public name: string;

  @array({
    of: ModuleConfiguration,
  })
  public modules: ModuleConfiguration[];
}
