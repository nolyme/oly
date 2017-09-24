# o*l*y http

HTTP Server and Client.

o*l*y http is a module of the [o*l*y project](https://nolyme.github.io/oly).

```ts
import { Kernel } from "oly";
import { HttpClient, HttpServerProvider } from "oly-http";

const kernel = Kernel.create({HTTP_SERVER_PORT: 4040});
const server = kernel.get(HttpServerProvider);     // koa
const client = kernel.get(HttpClient);             // axios

kernel
  .configure(() =>
    server.use(ctx => ctx.body = "Hello World"))   // koa middleware
  .start()
  .then(() =>
    client.get(server.hostname))                   // axios#get
  .then(console.log);
```

## Installation

```bash
$ npm install oly oly-http
```

## Dependencies

|  |  |
|--|--|
| HTTP Client | [axios](https://github.com/mzabriskie/axios) |
| HTTP Server Framework | [koa](https://github.com/koajs/koa) |
