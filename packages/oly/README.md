# o*l*y

Dependency injection, store and event emitter in one place.

o*l*y is a module of the [o*l*y project](https://nolyme.github.io/oly).

```ts
import { Kernel } from "oly";

Kernel
  .create(/* store */)
  .with(/* services & providers */)
  .start()
  .catch(console.error)
```

## Installation

```bash
$ npm install oly
```

## Features

### Injections

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

### Events

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

### States

```ts
import { Kernel } from "oly";

Kernel
  .create({A: "B"})
  .on("oly:state:mutate", console.log)
  .kernel
  .state("A", "C"); // { key: 'A', newValue: 'C', oldValue: 'B' }
```
