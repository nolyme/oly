import * as KoaRouter from "koa-router";
import { IClass, inject } from "oly-core";
import { IKoaContext } from "oly-http";
import { FieldMetadataUtil, ObjectMapper } from "oly-mapper";
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

  @inject(ObjectMapper)
  public objectMapper: ObjectMapper;

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

        return this.parsePathVariable(ctx, arg);

      } else if (!!arg.query) {

        return this.parseQueryParam(ctx, arg);

      } else if (!!arg.body) {

        return this.parseBody(ctx, arg);

      } else if (!!arg.upload) {

        // @upload (multer)
        return ctx.req[arg.upload] as IUploadedFile;

      } else {
        return ctx;
      }
    });
  }

  public parseBody(ctx: IKoaContext, arg: any) {

    const body = ctx.request.body;

    if (arg.body === Boolean) {
      return body === "true" || body === true;
    } else if (arg.body === Number) {
      return Number(body);
    } else if (arg.body === String) {
      return String(body);
    }

    if (!FieldMetadataUtil.hasFields(arg.body)) {
      return body;
    }

    try {
      return new ObjectMapper().parse(arg.body, body);
    } catch (e) {
      throw this.apiErrorService.validationHasFailed(arg.path);
    }
  }

  public parsePathVariable(ctx: IKoaContext, arg: any) {

    const value = ctx.params[arg.path];
    if (!value) {
      throw this.apiErrorService.missingPathVariable(arg.path);
    }

    if (arg.type === Boolean) {
      return value === "true";
    } else if (arg.type === Number) {
      return Number(value);
    } else {
      return value;
    }
  }

  public parseQueryParam(ctx: IKoaContext, arg: any) {

    const value = ctx.request.query[arg.query];
    if (!arg.type) {
      return value;
    }

    if (arg.type === Boolean) {
      return (value === "true" || value === "");
    } else if (arg.type === Number) {
      if (value === "") {
        return null;
      }
      return Number(value);
    } else if (FieldMetadataUtil.hasFields(arg.type)) {
      try {
        return this.objectMapper.parse(arg.type, value);
      } catch (e) {
        throw this.apiErrorService.validationHasFailed(e.message);
      }
    } else if (arg.type === Object) {
      if (value === "") {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch (e) {
        throw this.apiErrorService.invalidFormat("query", arg.query, "json");
      }
    } else {
      return value;
    }
  }
}
