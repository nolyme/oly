import { array } from "oly-mapper";
import { Link } from "./Link";

/**
 * @experimental
 */
export class Resource {
  @array({of: Link}) public links: Link[];
}
