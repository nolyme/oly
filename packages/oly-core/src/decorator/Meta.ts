import "reflect-metadata";
import { IAnyFunction, IClassOf } from "../kernel/interfaces/global";
import { IDecorator, IGenericDecorator, IGenericDecoratorFactory, IMetadata, IMetaIdentifier } from "./interfaces";

/**
 *
 */
export class Meta {

  /**
   *
   */
  public static reflect = Reflect;

  /**
   *
   * @param identifier
   */
  public static of(identifier: IMetaIdentifier) {
    return new Meta(identifier);
  }

  /**
   *
   * @param def
   * @param data
   * @param data2
   */
  public static decorator<T>(def: IClassOf<IDecorator>,
                             data?: any,
                             data2?: any): (IGenericDecoratorFactory<T> & IGenericDecorator) {
    return (t: any, p?: any, i?: any) => {
      const d = new def(data, data2);
      if (!this.negotiator(t, p, i, d)) {
        return this.decoratorWithoutOptions(def, t, p) as any;
      }
    };
  }

  /**
   *
   * @param def
   */
  public static decoratorWithOptions<T>(def: IClassOf<IDecorator>): IGenericDecoratorFactory<T> {
    return (data: T, data2: any) => {
      return this.decorator(def, data, data2);
    };
  }

  /**
   *
   * @param def
   * @param data
   * @param data2
   */
  public static decoratorWithoutOptions(def: IClassOf<IDecorator>,
                                        data?: any,
                                        data2?: any): IGenericDecorator {
    return (t: any, p?: any, i?: any) => {
      const d = new def(data, data2);
      this.negotiator(t, p, i, d);
    };
  }

  /**
   *
   * @param target
   * @param propertyKey
   */
  public static designType(target: object | IAnyFunction, propertyKey: string): IAnyFunction {
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
  public static designParamTypes(target: object | IAnyFunction, propertyKey: string): IAnyFunction[] {
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
  public get target() {
    if (this.isClass) {
      return this.identifier.target;
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
  public get<T extends IMetadata>(): T | null {
    return Meta.reflect.getOwnMetadata(this.identifier.key, this.target);
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
      this.data.properties[this.propertyKey] = {
        ...this.data.properties[this.propertyKey],
        ...data,
      };
    } else if (this.isParameter) {
      this.data.args[this.propertyKey] = this.data.args[this.propertyKey] || [];
      this.data.args[this.propertyKey][this.index] =
        this.data.args[this.propertyKey][this.index] || {};
      this.data.args[this.propertyKey][this.index] = {
        ...this.data.args[this.propertyKey][this.index],
        ...data,
      };
    }

    Meta.reflect.defineMetadata(this.identifier.key, this.data, this.target);
  }
}
