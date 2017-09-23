import { array, field } from "oly-json";

export class ModuleConfiguration {

  @field()
  public name: string;

  @field({required: false})
  public icon?: string;

  @field
  public type: string;

  @array({of: String, default: []})
  public decorators: string[];

  @array({of: String, default: []})
  public manuals: string[];

  @array({of: String, default: []})
  public components: string[];

  @array({of: String, default: []})
  public exceptions: string[];

  @array({of: String, default: []})
  public services: string[];

  @array({of: String, default: []})
  public dependencies: string[];
}
