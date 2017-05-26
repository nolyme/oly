import { IClass, inject, MetadataUtil } from "oly-core";
import { lyPages } from "../constants/keys";
import { IPageMetadataMap, IPageOptions } from "../interfaces";

/**
 * Page.
 *
 * @param url       Pathname
 * @param options
 */
export const page = (url: string, options: IPageOptions = {}) => {
  return (target: object, propertyKey: string) => {

    const pages: IPageMetadataMap = MetadataUtil.get(lyPages, target.constructor);

    // we secretly inject nested views inside parent, niark niark niark
    // this is useful when child depends on providers
    for (const child of options.children || []) {
      inject(child)(target, `${child.name}$auto`);
    }

    pages[propertyKey] = {
      abstract: options.abstract === true,
      children: options.children,
      name: options.name || propertyKey,
      target: target.constructor as IClass,
      propertyKey,
      url,
    };

    MetadataUtil.set(lyPages, pages, target.constructor);
  };
};
