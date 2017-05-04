import { createHashHistory } from "history";
import { Browser } from "./Browser";

/**
 * Same as Browser, but with Hash /#/my-url
 */
export class HashBrowser extends Browser {
  public history = createHashHistory();
}
