# o*l*y

o*l*y core is a module of the [o*l*y project](https://nolyme.github.io/oly).

### Installation

```bash
$ npm install oly
```

### Examples

#### DI

```ts
import { Kernel, inject } from "oly";

class B { c = "OK" }
class A { @inject b: B }

Kernel.create().get(A).b.c; // "OK"
```

#### Store

```ts
import { Kernel } from "oly";

const k = Kernel.create({A: "B"});
k.on("oly:state:mutate", console.log)
k.state("A", "C");
```

#### Providers

```ts
import { Kernel, inject, env, state } from "oly";

class Db {
  @env("DB_URL") url: string;
  
  conn: Connection;
  
  async onStart() {
    this.conn = await createConnection();
  }
}

class Repo {
  @inject db: Db;
}

Kernel
  .create({DB_URL: "locahost/test"})
  .with(Repo)
  .start()
  .catch(console.error)
```
