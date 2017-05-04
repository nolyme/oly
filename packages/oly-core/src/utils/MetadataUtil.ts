import { IAnyFunction, IClass } from "../interfaces/types";
import { _, CommonUtil } from "./CommonUtil";

/**
 *
 */
declare const Reflect: any;

/**
 * Reflect Metadata wrapper.
 */
export class MetadataUtil {

  /**
   *
   */
  public static getReflect() {
    if (!MetadataUtil.reflect) {
      if (!Reflect || !Reflect.getOwnMetadata) {
        // throw errors.reflectRequired();
        require("reflect-metadata"); // NOOOOOOOOOOOOOOoooo00000ooooOOOO
      }
      MetadataUtil.reflect = _.assign({}, Reflect);
    }
    return MetadataUtil.reflect;
  }

  /**
   * TODO: add generic.
   *
   * @param name
   * @param target
   * @param defaultValue
   */
  public static get(name: string, target: IClass | IAnyFunction, defaultValue: any = {}): any {
    return MetadataUtil.getReflect().getOwnMetadata(name, target) || defaultValue;
  }

  /**
   *
   * @param name
   * @param target
   * @param propertyKey
   * @param defaultValue
   */
  public static getProp(name: string, target: object, propertyKey: string, defaultValue: any = []): any {
    return MetadataUtil.getReflect().getMetadata(name, target, propertyKey) || defaultValue;
  }

  /**
   *
   * @param name
   * @param data
   * @param target
   */
  public static set(name: string, data: any, target: IClass | IAnyFunction): any {
    return MetadataUtil.getReflect().defineMetadata(name, data, target);
  }

  /**
   *
   * @param name
   * @param data
   * @param target
   * @param propertyKey
   */
  public static setProp(name: string, data: any, target: IClass | IAnyFunction, propertyKey: string): any {
    return MetadataUtil.getReflect().defineMetadata(name, data, target, propertyKey);
  }

  /**
   *
   * @param name
   * @param target
   */
  public static has(name: string, target: IClass | IAnyFunction): boolean {
    return MetadataUtil.getReflect().hasOwnMetadata(name, target);
  }

  /**
   *
   * @param key
   * @param target
   * @param as
   */
  public static deep(key: string, target: any, as: any[] | {} = {}): any {

    let meta = this.get(key, target, as);
    let parent;

    if (!!target.prototype
      && !!target.prototype.__proto__
      && !!target.prototype.__proto__.constructor) {
      parent = target.prototype.__proto__.constructor;
    }

    if (!!parent) {
      if (Array.isArray(as)) {
        meta = meta.concat(this.deep(key, parent, as));
      } else {
        meta = CommonUtil.assign({}, this.deep(key, parent, as), meta);
      }
    }

    return meta;
  }

  /**
   * Wat?
   *
   * @param func    Cool function
   */
  public static getParamNames(func: (...args: any[]) => any): string[] {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;
    const fnStr = func.toString().replace(STRIP_COMMENTS, "");
    return fnStr
        .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
        .match(ARGUMENT_NAMES) || [];
  }

  /**
   *
   */
  private static reflect: any;
}
