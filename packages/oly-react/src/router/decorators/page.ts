import { inject, MetadataUtil } from "oly-core";
import { lyPages } from "../constants";
import { IPageOptions, IPages } from "../interfaces";

/**
 * Page.
 *
 * @param url       Pathname
 * @param options
 */
export const page = (url: string, options: IPageOptions = {}) => {
  return (target: object, propertyKey: string) => {

    const pages: IPages = MetadataUtil.get(lyPages, target.constructor);

    if (options.nested) {
      options.children = Array.isArray(options.nested) ? options.nested : [options.nested];
    }

    // we secretly inject nested views inside parent, niark niark niark
    // this is useful when child depends on providers
    for (const child of options.children || []) {
      inject(child)(target, `${child.name}$auto`);
    }

    pages[propertyKey] = pages[propertyKey] || {};
    pages[propertyKey].args = pages[propertyKey].args || [];
    pages[propertyKey].url = url;
    pages[propertyKey].options = options;

    MetadataUtil.set(lyPages, pages, target.constructor);
  };
};
