import { field } from "oly-mapper";

/**
 * @experimental
 */
export class Link {
  @field() public rel: string;
  @field() public href: string;
  @field() public method: string;
}
