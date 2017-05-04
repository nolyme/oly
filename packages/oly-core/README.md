# [o*l*y](https://github.com/nolyme/oly/) core

```ts
import { env, inject, Kernel } from "oly-core";

class B {
  @env("C") c;
}

class A {
  @inject() b: B;
}

const store = {C: "D"};
const kernel = new Kernel(store);

console.log(kernel.get(A).b.c); // D
```

## Installation

```bash
$ npm install oly-core
```

## Configuration

| ENV | Provider | Default | Description |
|-----|----------|---------|-------------|
| **OLY_APP_NAME** | Logger | "MyApp" | The name (or role) of your kernel.  |
| **OLY_LOGGER_LEVEL** | Logger | "INFO" | The logging level. TRACE > DEBUG > INFO > WARN > ERROR |

## Docs

There are only two classes, **Kernel** and **Logger**. Logger is well named.

Kernel is like a module. It will handle a store, events and relationships between all the application's dependencies.

And most importantly, Kernel properly handles a *context*.

```typescript
import { Kernel, Logger, env, inject } from "oly-core";

class App {
  
  @env("NAME") name: string;
  
  @inject logger: Logger;
  
  onStart() {
    this.logger.info(`Hello ${this.name}`);
  }
}

new Kernel({NAME: "World"})
  .with(App)
  .start();
```
Everything must be in the context of the kernel. Nothing, no data, should get out of the kernel, there is no globals. Everything must be stateless.

### Kernel

#### new Kernel(store: object)

Create new instance with a store. That's probably the only one keyword '*new*' of your app.

> Store is typed by default. (as IEnv)

```typescript
new Kernel({OLY_LOGGER_LEVEL: "TRACE"})
// or
new Kernel(process.env)
```

----
#### Kernel#with(...definitions: IClass[]): Kernel

Declare n definitions.

Even if the declarations are done automatically (with @inject), 
you must declare at least one class to do something to create a dependency tree.

```typescript
class A {}
class B {}
class C {}

new Kernel().with(A, B, C);
```

----
#### Kernel#get(definition: IClassOf\<T>): T

Declare and instantiate one definition.

```typescript
class A { b = "c" };
const a = new Kernel().get(A);
console.log(a.b); // c
```

----
#### Kernel#start(): Promise\<Kernel>

Lock your kernel and trigger the async #onStart() hook of each provider.
After the lock, you can't register new providers.

The reason is simple, #start() gives you the warranty that your app is ready (db connection is ok, http server is ok, ...), to keep this warranty the kernel will reject all new providers.

```typescript
class A { onStart() { console.log("Hi") } };
new Kernel()
  .with(A)
  .start()
  .catch(e => console.error(e));
```

----
#### Kernel#stop(): Promise\<Kernel>

Unlock your kernel and trigger the async #onStop() hook of each provider.
This is very useful if you want a graceful reload of your server.

```typescript
const kernel = new Kernel().with(A);
await kernel.start();
// CTRL+C
process.once("SIGINT", () => kernel.stop());
```

### Decorators

#### @inject(type?: IClass)

Create a [virtual getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) of a dependency based on optional type.

```typescript
class A {
  @inject(A) a: A;
  // is like
  get a() { return kernel.get(A); }
}
```

----
#### @env(name: string)

Create virtual getter of a store based on given name.
> Configuration

```typescript
class A {
  @env("A") a: string;
  // is like
  get a() { return kernel.env("A"); }
}
```

----
#### @state(name?: string)

Create virtual getter and setter of a store based on optional name.

```typescript
class A {
  @state("A") a: string; 
  // is like
  get a() { return kernel.state("A"); }
  set a(val) { kernel.state("A", val); }
}
```
