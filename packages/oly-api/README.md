# o*l*y api

o*l*y api is a module of the [o*l*y project](https://nolyme.github.io/oly).

```ts
import { inject, Kernel } from "oly";
import { ApiProvider, get } from "oly-api";

class Repo {
  query = () => Promise.resolve([1, 2, 3]);
}

class Api {
  @inject repo: Repo;

  @get("/users")
  async findUsers() {
    return await this.repo.query();
  }
}

Kernel
  .create({
    HTTP_SERVER_PORT: 6000,
  })
  .with(Api, ApiProvider)
  .start()
  .catch(console.error);

// curl http://localhost:6000/api/users -> [1,2,3]
```

### Installation

```bash
$ npm install oly oly-api
```

### Why

- Koa wrapper with ES6 class
- some @decorator (@get, @query, @body, ...)
- fork context each request

