import { MetadataUtil } from "oly-core";
import { lyPages } from "../constants";
import { IPageOptions, IPages } from "../interfaces";

/**
 *
 * @param url
 * @param options
 * @decorator
 */
export const page =
  (url: string, options: IPageOptions = {}) =>
    (target: object, propertyKey: string) => {

      const pages: IPages = MetadataUtil.get(lyPages, target.constructor);

      if (options.nested) {
        options.children = Array.isArray(options.nested) ? options.nested : [options.nested];
      }

      pages[propertyKey] = pages[propertyKey] || {};
      pages[propertyKey].args = pages[propertyKey].args || [];
      pages[propertyKey].url = url;
      pages[propertyKey].options = options;

      MetadataUtil.set(lyPages, pages, target.constructor);
    };

/**
 *
 * @param t
 * @param p
 */
export const pageLayout = (t: object, p: string) => page(":layout:")(t, p);

/**
 *
 * @param t
 * @param p
 */
export const page404 = (t: object, p: string) => page("**")(t, p);

/**
 *
 * @param t
 * @param p
 */
export const page500 = (t: object, p: string) => page(":error:")(t, p);
