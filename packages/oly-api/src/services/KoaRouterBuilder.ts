import * as KoaRouter from "koa-router";
import { IClass, inject } from "oly-core";
import { IKoaContext } from "oly-http";
import { FieldMetadataUtil, IType, JsonService } from "oly-mapper";
import { IRouteMetadata, RouterMetadataUtil } from "oly-router";
import { IUploadedFile } from "../interfaces";
import { end } from "../middlewares/end";
import { ApiErrorService } from "./ApiErrorService";

/**
 * koa-router build based on metadata.
 */
export class KoaRouterBuilder {

  @inject(ApiErrorService)
  protected apiErrorService: ApiErrorService;

  @inject(JsonService)
  protected json: JsonService;

  /**
   * Transform router metadata into a fresh koa-router object.
   *
   * @param definition   Annotated class with router metadata
   */
  public createFromDefinition(definition: IClass): KoaRouter {

    const routerMetadata = RouterMetadataUtil.getRouter(definition);
    const prefix = (!!routerMetadata.prefix && routerMetadata.prefix !== "/")
      ? routerMetadata.prefix
      : "";
    const koaRouter = new KoaRouter({prefix});

    for (const propertyKey of Object.keys(routerMetadata.routes)) {

      const route = routerMetadata.routes[propertyKey];
      const path = route.path || "/";
      const method = route.method || "GET";
      const middlewares = route.middlewares || [];
      const mount = koaRouter[method.toLowerCase()];

      mount.apply(koaRouter, [
        path,
        ...middlewares,
        end(definition, propertyKey, route),
      ]);

      // hack used for logging only (@see ApiProvider)
      (koaRouter.stack[koaRouter.stack.length - 1] as any).propertyKey = propertyKey;
    }

    return koaRouter;
  }

  /**
   * Create arguments of controller action based on:
   * - current koa context (IKoaContext) which represents the incomming request
   * - router metadata (IRoute)
   *
   * @param ctx     Koa context
   * @param route   Route metadata
   */
  public parseParamTypes(ctx: IKoaContext, route: IRouteMetadata): any[] {
    return Object.keys(route.args).map((index) => {

      if (!route.args) {
        return;
      }

      const arg = route.args[index];

      if (!!arg.path) {

        const value: string = ctx.params[arg.path];
        if (!value) {
          throw this.apiErrorService.missing("pathVariable", arg.path);
        }
        return this.parseAndCast(value, arg.type, arg.path, "pathVariable");

      } else if (!!arg.query) {

        const value: string = ctx.query[arg.query];
        if (!value && arg.required === true) {
          throw this.apiErrorService.missing("queryParam", arg.query);
        }
        return this.parseAndCast(value, arg.type, arg.query, "queryParam");

      } else if (!!arg.header) {

        const value: string = ctx.header[arg.header.toLowerCase()];
        if (!value && arg.required === true) {
          throw this.apiErrorService.missing("header", arg.query);
        }
        return this.parseAndCast(value, arg.type, arg.header, "header");

      } else if (!!arg.body) {

        const value: object | object[] = ctx.request.body;
        if (!value && arg.required === true) {
          throw this.apiErrorService.missing("request", "body");
        }
        return this.parseBody(value, arg);

      } else if (!!arg.upload) {

        // @upload (multer)
        return ctx.req[arg.upload] as IUploadedFile;

      } else {
        return ctx;
      }
    });
  }

  /**
   * Body is already parsed by koa-bodyparser.
   * However, we can map json to typed object and make some validations!
   *
   * @param body    Object
   * @param arg     Arg definition
   * @return        Object
   */
  public parseBody(body: any, arg: any) {

    if (!FieldMetadataUtil.hasFields(arg.body)) {
      return body;
    }

    try {
      return this.json.build(arg.body, body);
    } catch (e) {
      throw this.apiErrorService.validationHasFailed(arg.path);
    }
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
  protected parseAndCast(value: any, type: IType, argKey: string, argType: string): any {

    if (!type || !value) {
      return value;
    } else if (type === Boolean) {
      return (value === "true" || value === "");
    } else if (type === Number) {
      if (value === "") {
        return null;
      }
      return Number(value);
    } else if (FieldMetadataUtil.hasFields(type)) {
      try {
        return this.json.build(type as IClass, value);
      } catch (e) {
        throw this.apiErrorService.validationHasFailed(e.message);
      }
    } else if (type === Object) {
      if (value === "") {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch (ignore) {
        throw this.apiErrorService.invalidFormat(argType, argKey, "json");
      }
    } else if (type === String) {
      return value.toString();
    } else {
      return value;
    }
  }
}
