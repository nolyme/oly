import { MetadataUtil } from "oly-core";
import { lyPages } from "../constants";
import { IPages } from "../interfaces";

/**
 *
 */
export const query = (value: string) => (target: object, propertyKey: string, index: number) => {

  const pages: IPages = MetadataUtil.get(lyPages, target.constructor);
  pages[propertyKey] = pages[propertyKey] || {};
  pages[propertyKey].args = pages[propertyKey].args || [];
  pages[propertyKey].args[index] = {query: value};

  MetadataUtil.set(lyPages, pages, target.constructor);
};
