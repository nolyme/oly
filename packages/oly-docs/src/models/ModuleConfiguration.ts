import { array, field } from "oly-mapper";

export class ModuleConfiguration {
  @field() public name: string;
  @field() public home: string;
  @array({of: String}) public decorators: string[];
  @array({of: String}) public env: string[];
  @array({of: String}) public services: string[];
  @array({of: String}) public dependencies: string[];
}
