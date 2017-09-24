# Providers

## Implicit

Example: database connection.

```ts
import { env, inject, IProvider, Kernel, state } from "oly";
import { createConnection, Connection } from "superdblib"; 

class DatabaseProvider implements IProvider {
  @env("DB_URL") url: string;
  @state conn: Connection;

  async onStart() {
    this.conn = await createConnection(this.url);
  }
}

class Repository {
  @inject db: DatabaseProvider;
}

Kernel
  .create({DB_URL: "postgres://localhost/test"})
  .with(Repository) // Repository --> DatabaseProvider
  .start()
  .then(k => console.log(k.get(Repository).db.conn));
```

## Explicit

Example: http server.

```ts
import { env, IDeclarations, Kernel, Meta, state } from "oly";
import { App } from "superhttpserver"; 

class ServerProvider {
  @env("SERVER_PORT") port: number;
  @state app: any;

  async onStart(declarations: IDeclarations) {

    this.app = App();
    for (const {definition: target} of declarations) {
      const routes = Meta.of({key: "routes", target});
      if (routes) {
        this.app.mount(routes);
      }
    }

    await this.app.listen(this.port);
  }
}

class Controller {
  @get("/") index(ctx) {
    ctx.body = "Hello";
  }
}

Kernel
  .create({SERVER_PORT: 8080})
  .with(Controller, ServerProvider) // Controller <-?-> ServerProvider
  .start();
```
