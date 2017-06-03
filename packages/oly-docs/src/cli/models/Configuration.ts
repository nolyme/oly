import { array, field } from "oly-json";
import { ModuleConfiguration } from "./ModuleConfiguration";

export class Configuration {

  @field() public name: string;

  @field({required: false}) public home?: string;

  @field({required: false}) public version?: string;

  @array({
    of: ModuleConfiguration,
  })
  public modules: ModuleConfiguration[];
}
