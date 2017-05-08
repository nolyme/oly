import { array, field } from "oly-mapper";
import { ModuleConfiguration } from "./ModuleConfiguration";

export class Configuration {
  @field() public name: string;
  @field() public home: string;
  @field() public version: string;
  @array({
    of: ModuleConfiguration,
  })
  public modules: ModuleConfiguration[];
}
