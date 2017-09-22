# o*l*y security

o*l*y security is an extension of [o*l*y api](https://nolyme.github.io/oly/#/m/oly-api).

```ts
import { inject, Kernel } from "oly";
import { ApiProvider, get } from "oly-api";
import { auth, JwtAuth, Auth } from "oly-security";

class Api {
  @inject auth: Auth;

  @get("/token") token() {
    return this.auth.createToken({id: "0", roles: ["ADMIN"]});
  }

  @auth("ADMIN")
  @get("/secret") secret() {
    return {ok: true, id: this.auth.token.id};
  }
}

Kernel
  .create()
  .with(Api, ApiProvider, JwtAuth)
  .start()
  .catch(console.error);
```

### Installation

```bash
$ npm install oly oly-api
```
