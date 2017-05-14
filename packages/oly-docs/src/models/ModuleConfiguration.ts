import { array, field } from "oly-mapper";

export class ModuleConfiguration {

  @field()
  public name: string;

  @field({required: false})
  public home?: string;

  @field({required: false})
  public icon?: string;

  @array({of: String, default: []})
  public decorators: string[];

  @array({of: String, default: []})
  public services: string[];

  @array({of: String, default: []})
  public dependencies: string[];
}
