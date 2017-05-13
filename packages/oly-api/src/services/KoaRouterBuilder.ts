import * as KoaRouter from "koa-router";
import { _, IClass } from "oly-core";
import { HttpError, IKoaContext } from "oly-http";
import { FieldMetadataUtil, ObjectMapper } from "oly-mapper";
import { RouterMetadataUtil } from "oly-router";
import { IRoute, IUploadedFile } from "../interfaces";
import { end } from "../middlewares/end";

/**
 * koa-router build based on metadata.
 */
export class KoaRouterBuilder {

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
   * It's just a mapping.
   *
   * @param ctx     Koa context
   * @param route   Route metadata
   */
  public parseParamTypes(ctx: IKoaContext, route: IRoute): any[] {
    return Object.keys(route.args).map((index) => {

      if (!route.args) {
        return;
      }

      const arg = route.args[index];

      if (!!arg.path) {

        // @path
        return (ctx as any).params[arg.path];

      } else if (!!arg.query) {

        // @query
        const value = ctx.request.query[arg.query];
        return _.parseNumberAndBoolean(value);

      } else if (!!arg.upload) {

        // @upload (multer)
        return ctx.req[arg.upload] as IUploadedFile;

      } else if (!!arg.body) {

        // @body
        const body = (ctx.request as any).body;

        if (!FieldMetadataUtil.hasFields(arg.body)) {
          return body;
        }

        // this is't a good idea.
        // @body should just return the body.
        try {
          return new ObjectMapper().parse(arg.body, body);
        } catch (e) {
          throw new HttpError(400, "Validation has failed", e);
        }

      } else {
        throw new Error("Unsupported paramTypes");
      }
    });
  }
}
