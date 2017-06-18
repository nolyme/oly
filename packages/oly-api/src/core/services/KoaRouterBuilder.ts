import * as KoaRouter from "koa-router";
import { Class, inject } from "oly-core";
import { MetaRouter } from "../../router/MetaRouter";
import { olyApiErrors } from "../constants/errors";
import { BadRequestException } from "../exceptions/BadRequestException";
import { ApiMiddlewares } from "./ApiMiddlewares";

/**
 * koa-router build based on metadata.
 */
export class KoaRouterBuilder {

  @inject
  protected apiMiddlewares: ApiMiddlewares;

  /**
   * Transform router metadata into a fresh koa-router object.
   *
   * @param definition   Annotated class with router metadata
   */
  public createFromDefinition(definition: Class): KoaRouter {

    const routerMetadata = MetaRouter.get(definition);
    if (!routerMetadata) {
      throw new Error("There is no meta router in this class");
    }

    const prefix = (routerMetadata.target.prefix && routerMetadata.target.prefix !== "/")
      ? routerMetadata.target.prefix
      : "";
    const koaRouter = new KoaRouter({prefix});

    const keys = Object.keys(routerMetadata.properties);
    for (const propertyKey of keys) {

      const route = routerMetadata.properties[propertyKey];
      const mount = koaRouter[route.method.toLowerCase()];

      mount.apply(koaRouter, [
        route.path,
        ...route.middlewares,
        this.apiMiddlewares.invoke(definition, propertyKey),
      ]);

      // hack used for logging only (@see ApiProvider)
      (koaRouter.stack[koaRouter.stack.length - 1] as any).propertyKey = propertyKey;
    }

    return koaRouter;
  }

  /**
   * Convert value into the requested type.
   * Used by header, query and path.
   *
   * @param value       Current value (string)
   * @param type        Requested type
   * @param argKey      Who need this (name)
   * @param argType     Who need this (type)
   * @return            Value, converted if possible
   */
  public parseAndCast(value: any, type: Class, argKey: string, argType: string): any {

    if (!type) {
      return value;
    } else if (type === Boolean) {
      if (value === "") {
        return true;
      }
      if (typeof value === "string") {
        return !(value === "false" || value === "0");
      }
      return !!value;
    } else if (type === Number) {
      if (value === "") {
        return null;
      }
      if (typeof value === "number") {
        return value;
      }
      return Number(value);
    } else if (type === Object) {
      if (value === "") {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch (ignore) {
        throw new BadRequestException(olyApiErrors.invalidFormat(argType, argKey, "json"));
      }
    } else if (type === String && !!value) {
      return value.toString();
    } else {
      return value;
    }
  }
}
