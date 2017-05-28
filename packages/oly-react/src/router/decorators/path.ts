import { MetadataUtil } from "oly-core";
import { lyPages } from "../constants/keys";
import { IPageMetadataMap } from "../interfaces";

/**
 * Path.
 *
 * @param pathVariableName       Path variable name
 */
export const path = (pathVariableName: string) => {
  return (target: object, propertyKey: string, index: number) => {

    const pages: IPageMetadataMap = MetadataUtil.get(lyPages, target.constructor);

    pages[propertyKey] = pages[propertyKey] || {};
    pages[propertyKey].args = pages[propertyKey].args || [];
    pages[propertyKey].args[index] = {
      type: "path",
      name: pathVariableName,
    };

    MetadataUtil.set(lyPages, pages, target.constructor);
  };
};
