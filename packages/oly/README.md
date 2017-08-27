# o*l*y

o*l*y is a module of the [o*l*y project](https://nolyme.github.io/oly).

### Installation

```bash
$ npm install oly
```

### Why

#### Pseudo DI

```ts
import { inject, Kernel } from "oly";

class A { text = "A" }
class B { text = "B" }
class C { @inject a: A }

Kernel
  .create()
  .with({provide: A, use: B})
  .get(C).a.text // B
```

#### Store

```ts
import { Kernel } from "oly";

Kernel
  .create({A: "B"})
  .on("oly:state:mutate", console.log)
  .kernel
  .state("A", "C"); // { key: 'A', newValue: 'C', oldValue: 'B' }
```

#### Providers

```ts
import { env, inject, Kernel, state } from "oly";

class Db {
  @env("DB_URL") url: string;
  @state conn: any;

  async onStart() {
    this.conn = await Promise.resolve(`Connection(${this.url})`);
  }
}

class Repo {
  @inject db: Db;
}

Kernel
  .create({DB_URL: "localhost/test"})
  .with(Repo)
  .start()
  .then(k => console.log(k.state("Db.conn")));
```

#### Context

```ts
import { Kernel, state } from "oly";

class A {
  @state shared = "S";
  isolated = "I";
}

const root = Kernel.create();
console.log(root.id);               // taohu1sasyk2
console.log(root.get(A).shared);    // "S"
console.log(root.get(A).isolated);  // "I"

const child = root.fork();
console.log(child.id);              // taohu1sasyk2.rlmhlpqe87dm

child.get(A).shared = "S2";
child.get(A).isolated = "I2";

console.log(root.get(A).shared);    // "S2"
console.log(root.get(A).isolated);  // "I"
```
