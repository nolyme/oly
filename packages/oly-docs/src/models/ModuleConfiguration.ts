import { array, field } from "oly-mapper";

export class ModuleConfiguration {

  @field()
  public name: string;

  @field({required: false})
  public home?: string;

  @array({of: String, default: []})
  public decorators: string[];

  @array({of: String, default: []})
  public services: string[];

  @array({of: String, default: []})
  public dependencies: string[];
}
