import * as KoaRouter from "koa-router";
import { IClass, inject } from "oly-core";
import { IKoaContext } from "oly-http";
import { FieldMetadataUtil, IType, JsonService, TypeUtil } from "oly-mapper";
import { IRouteMetadata, RouterMetadataUtil } from "oly-router";
import { olyApiErrors } from "../constants/errors";
import { BadRequestException } from "../exceptions/BadRequestException";
import { IUploadedFile } from "../interfaces";
import { ApiMiddlewares } from "./ApiMiddlewares";

/**
 * koa-router build based on metadata.
 */
export class KoaRouterBuilder {

  @inject(JsonService)
  protected json: JsonService;

  @inject(ApiMiddlewares)
  protected apiMiddlewares: ApiMiddlewares;

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
        this.apiMiddlewares.invoke(definition, propertyKey, route),
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
          throw new BadRequestException(olyApiErrors.missing("pathVariable", arg.path));
        }
        return this.parseAndCast(value, arg.type, arg.path, "pathVariable");

      } else if (!!arg.query) {

        const value: string = ctx.query[arg.query];
        if (!value && arg.required === true) {
          throw new BadRequestException(olyApiErrors.missing("queryParam", arg.query));
        }
        return this.parseAndCast(value, arg.type, arg.query, "queryParam");

      } else if (!!arg.header) {

        const value: string = ctx.header[arg.header.toLowerCase()];
        if (!value && arg.required === true) {
          throw new BadRequestException(olyApiErrors.missing("header", arg.header));
        }
        return this.parseAndCast(value, arg.type, arg.header, "header");

      } else if (!!arg.body) {

        const value: object | object[] = ctx.request.body;
        if (!value && arg.required === true) {
          throw new BadRequestException(olyApiErrors.missing("request", "body"));
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
      throw new BadRequestException(e, olyApiErrors.validationHasFailed());
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

    if (!type) {
      return value;
    } else if (type === Boolean) {
      if (value === "") {
        return true;
      }
      return TypeUtil.forceBoolean(value);
    } else if (type === Number) {
      if (value === "") {
        return null;
      }
      return TypeUtil.forceNumber(value);
    } else if (FieldMetadataUtil.hasFields(type)) {
      try {
        return this.json.build(type as IClass, value); // TODO: ValidationException() + .reason or field
      } catch (e) {
        throw new BadRequestException(e, olyApiErrors.validationHasFailed());
      }
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
