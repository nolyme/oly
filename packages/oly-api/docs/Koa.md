### Koa

http://koajs.com/

o*l*y is just a wrapper of Koa.

```ts
import { Kernel } from "oly";
import { ApiProvider, get } from "oly-api";
import { IKoaContext, IKoaMiddleware } from "oly-http";

const koaMiddleware: IKoaMiddleware = async (ctx, next) => {
  console.log(ctx.request.toJSON());
  await next();
};

export class Api {
  @get("/") root(ctx: IKoaContext) {
    ctx.body = "Hello World";
  }
}

Kernel.create()
  .with(Api)
  .configure(k => k
    .get(ApiProvider)
    .use(koaMiddleware),
  )
  .start()
  .catch(console.error);
```

### Default middlewares

ApiProvider uses:
- koa-bodyparser (parse http body) https://github.com/koajs/bodyparser 
- koa-router     (@get, @post, @put, ...) https://github.com/alexmingoia/koa-router 
- a custom errorHandler (ApiMiddlewares#errorHandler())
- a custom request logger (ApiMiddlewares#log())
