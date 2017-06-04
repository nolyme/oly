import { _ } from "../kernel/Global";
import { DecoratorException } from "./DecoratorException";
import {
  IDecorator,
  IDecoratorConstructor,
  IGenericDecorator,
  IGenericDecoratorFactory,
  IMetadata,
  IMetaIdentifier,
} from "./interfaces";

/**
 *
 */
export class Meta {

  /**
   * Ensure one instance of Reflect polyfill.
   */
  public static get reflect() {
    const R = _.get("Reflect");
    if (!R || !R.decorate) {
      require("reflect-metadata");
      _.set("Reflect", Reflect);
    }
    return _.get("Reflect");
  }

  /**
   *
   * @param identifier
   */
  public static of(identifier: IMetaIdentifier): Meta {
    return new Meta(identifier);
  }

  /**
   *
   * @param Decorator
   * @param data1
   * @param data2
   * @param data3
   */
  public static decorator<T>(Decorator: IDecoratorConstructor,
                             data1?: any,
                             data2?: any,
                             data3?: any): (IGenericDecoratorFactory<T> & IGenericDecorator) {
    return (t: any, p?: any, i?: any) => {
      const d = new Decorator(data1, data2, data3);
      if (!this.negotiator(t, p, i, d)) {
        return this.decoratorWithoutOptions(Decorator, t, p, i) as any;
      }
    };
  }

  /**
   *
   * @param Decorator
   */
  public static decoratorWithOptions<T>(Decorator: IDecoratorConstructor): IGenericDecoratorFactory<T> {
    return (data1: T, data2: any, data3: any) => {
      return this.decorator(Decorator, data1, data2, data3);
    };
  }

  /**
   *
   * @param Decorator
   * @param data1
   * @param data2
   * @param data3
   */
  public static decoratorWithoutOptions(Decorator: IDecoratorConstructor,
                                        data1?: any,
                                        data2?: any,
                                        data3?: any): IGenericDecorator {
    return (t: any, p?: any, i?: any) => {
      const d = new Decorator(data1, data2, data3);
      if (!this.negotiator(t, p, i, d)) {
        const name = "@" + Decorator.name.replace("Decorator", "").toLowerCase();
        const meta = Meta.of({key: "fake", target: t, propertyKey: p});
        const accepts = ["asClass", "asProperty", "asMethod", "asParameter"].filter((n) =>
          !!Decorator.prototype[n]);
        const target = meta.target.name + (p ? `#${p}` : "");

        throw new DecoratorException(`You can't use '${name}' on '${target}' (${name}: ${accepts})`);
      }
    };
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
   * @param target
   * @param propertyKey
   */
  public static designType(target: object | Function, propertyKey: string): Function {
    if (propertyKey === "$constructor") {
      return Meta.reflect.getOwnMetadata("design:type",
        typeof target === "function" ? target : target.constructor);
    }
    return Meta.reflect.getOwnMetadata("design:type",
      typeof target === "function" ? target.prototype : target,
      propertyKey);
  }

  /**
   *
   * @param target
   * @param propertyKey
   */
  public static designParamTypes(target: object | Function, propertyKey: string): Function[] {
    if (propertyKey === "$constructor") {
      return Meta.reflect.getOwnMetadata("design:paramtypes",
        typeof target === "function" ? target : target.constructor);
    }
    return Meta.reflect.getOwnMetadata("design:paramtypes",
      typeof target === "function" ? target.prototype : target,
      propertyKey);
  }

  /**
   *
   */
  private static Reflect: any;

  /**
   *
   * @param t
   * @param p
   * @param i
   * @param d
   */
  private static negotiator(t: any, p: any, i: any, d: IDecorator): boolean {

    if (typeof t === "object" && typeof p === "string" && typeof i === "number" && d.asParameter) {
      d.asParameter(t, p, i);
      return true;
    }
    if (typeof t === "function" && typeof p === "undefined" && typeof i === "number" && d.asParameter) {
      d.asParameter(t.prototype, "$constructor", i);
      return true;
    }
    if (typeof t === "object" && typeof p === "string" && typeof i === "object" && d.asMethod) {
      d.asMethod(t, p, i);
      return true;
    }
    if (typeof t === "object" && typeof p === "string" && typeof i === "undefined" && d.asProperty) {
      d.asProperty(t, p);
      return true;
    }
    if (typeof t === "function" && typeof p === "undefined" && typeof i === "undefined" && d.asClass) {
      d.asClass(t);
      return true;
    }

    return false;
  }

  /**
   *
   */
  public data: IMetadata = {
    target: {},
    properties: {},
    args: {},
  };

  /**
   *
   * @param identifier
   */
  public constructor(private identifier: IMetaIdentifier) {
  }

  /**
   *
   */
  public get isClass() {
    return typeof this.identifier.target === "function"
      && typeof this.identifier.propertyKey === "undefined"
      && typeof this.identifier.index === "undefined";
  }

  /**
   *
   */
  public get isProperty() {
    return typeof this.identifier.target === "object"
      && typeof this.identifier.propertyKey === "string"
      && typeof this.identifier.index === "undefined";
  }

  /**
   *
   */
  public get isParameter() {
    return typeof this.identifier.propertyKey === "string"
      && typeof this.identifier.index === "number";
  }

  /**
   *
   */
  public get target(): Function {
    if (this.isClass) {
      return this.identifier.target as Function;
    }
    return this.identifier.target.constructor;
  }

  /**
   *
   */
  public get propertyKey(): string {
    if (this.identifier.propertyKey) {
      return this.identifier.propertyKey;
    }
    throw new Error("There is no propertyKey");
  }

  /**
   *
   */
  public get index(): number {
    if (typeof this.identifier.index !== "undefined") {
      return this.identifier.index;
    }
    throw new Error("There is no index");
  }

  /**
   *
   */
  public has(): boolean {
    return Meta.reflect.hasMetadata(this.identifier.key, this.target);
  }

  /**
   *
   */
  public get<T extends IMetadata>(): T | undefined {
    return Meta.reflect.getOwnMetadata(this.identifier.key, this.target);
  }

  /**
   *
   */
  public deep<T extends IMetadata>(): T | undefined {
    const $deep = <T extends IMetadata>(key: string, target: Function): T | undefined => {
      const meta: T = Meta.reflect.getOwnMetadata(key, target);

      if (target.prototype
        && target.prototype.__proto__
        && target.prototype.__proto__.constructor) {
        const metaParent = $deep<T>(key, target.prototype.__proto__.constructor);
        if (!meta) {
          return metaParent;
        }
        if (metaParent) {
          return _.merge(metaParent, meta);
        }
      }

      return meta;
    };

    return $deep<T>(this.identifier.key, this.target);
  }

  /**
   *
   * @param data
   */
  public set(data: object): void {

    this.data = this.get() || this.data;

    if (this.isClass) {
      this.data.target = {
        ...this.data.target,
        ...data,
      };
    } else if (this.isProperty) {
      this.data.properties[this.propertyKey] = this.data.properties[this.propertyKey] || {};
      this.data.properties[this.propertyKey] = _.merge(this.data.properties[this.propertyKey], data);
    } else if (this.isParameter) {
      this.data.args[this.propertyKey] = this.data.args[this.propertyKey] || [];
      this.data.args[this.propertyKey][this.index] = this.data.args[this.propertyKey][this.index] || {};
      this.data.args[this.propertyKey][this.index] = _.merge(this.data.args[this.propertyKey][this.index], data);
    }

    Meta.reflect.defineMetadata(this.identifier.key, this.data, this.target);
  }
}
