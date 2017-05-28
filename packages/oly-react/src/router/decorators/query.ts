import { MetadataUtil } from "oly-core";
import { lyPages } from "../constants/keys";
import { IPageMetadataMap } from "../interfaces";

/**
 * Query.
 *
 * @param queryParamName       Query parameter name
 */
export const query = (queryParamName: string) => {
  return (target: object, propertyKey: string, index: number) => {

    const pages: IPageMetadataMap = MetadataUtil.get(lyPages, target.constructor);

    pages[propertyKey] = pages[propertyKey] || {};
    pages[propertyKey].args = pages[propertyKey].args || [];
    pages[propertyKey].args[index] = {
      type: "query",
      name: queryParamName,
    };

    MetadataUtil.set(lyPages, pages, target.constructor);
  };
};
