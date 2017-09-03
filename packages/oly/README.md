# o*l*y

o*l*y is a module of the [o*l*y project](https://nolyme.github.io/oly).

## Installation

```bash
$ npm install oly
```

## Features

#### Injections

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

#### Events

```ts
import { Kernel, on } from "oly";

class App {
  @on say = msg => console.log(msg)
}

Kernel
  .create()
  .with(App)
  .emit("App.say", "hello"); // hello
```

#### States

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
import { env, inject, IProvider, Kernel, state } from "oly";

class DbProvider implements IProvider {
  @env("DB_URL") url: string;
  @state conn;

  async onStart() {
    this.conn = await Promise.resolve(`Connection(${this.url})`);
  }
}

class Repo {
  @inject db: DbProvider;
}

Kernel
  .create({DB_URL: "localhost/test"})
  .with(Repo)
  .start()
  .then(k => console.log(k.state("Db.conn")));
```
