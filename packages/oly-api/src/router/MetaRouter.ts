import { Class, Meta } from "oly-core";
import { olyRouterKeys } from "./constants/keys";
import { IRouterMetadata } from "./interfaces";

export class MetaRouter {

  public static get(target: Class): IRouterMetadata | null {
    return Meta.of({key: olyRouterKeys.router, target}).deep<IRouterMetadata>();
  }
}
