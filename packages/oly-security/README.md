# o*l*y security

Secure a REST API.

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
  .with({provide: Auth, use: JwtAuth})
  .with(Api, ApiProvider)
  .start()
  .catch(console.error);
```

## Installation

```bash
$ npm install oly oly-api
```

## Dependencies

|  |  |
|--|--|
| JSON Web Token | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) |
| Hashing | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
