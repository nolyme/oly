### Naming Convention

#### &#60;Components/&#62;

[https://facebook.github.io/react/docs/react-component.html](https://facebook.github.io/react/docs/react-component.html)

#### @decorators

This is just a function called on the start on the application. The decorator **enhances** a property/class by adding
metadata or modifying the prototype.

```ts
const init = (val: any) => (target: object, propertyKey: string) => {
  target[propertyKey] = val;
} 

class Person {
  
  @init("Jean")
  name: string;
}
```

[https://www.typescriptlang.org/docs/handbook/decorators.html](https://www.typescriptlang.org/docs/handbook/decorators.html)

#### Services

Class supposed to be used everywhere in your code. 

Most of the time, services:
 - are stateless.
 - follow the [singleton](https://en.wikipedia.org/wiki/Singleton_pattern) pattern.

Some services:
 - Logger
 - Router
 - Json

```ts
class Service {
  add(n1: number, n2: number) {
    return n1 + n2;
  }
}
const k = Kernel.create();
const s = k.get(Service);
const r = s.add(1, 1); // 2
```

#### Providers

Big and heavy service which provides stuffs. **Don't use providers directly.** 

Most of the time, providers:
 - are stateful.
 - use Kernel#start() to initialize their states.
 - are linked to a service.

Some providers:
 - ApiProvider
 - ReactBrowserProvider
 - ReactServerProvider  

```ts
class Provider {
  @state counter;
  
  onStart() {
    this.counter = 0;
  }
}

class Service {
  @inject provider: Provider;
  
  inc() {
    return this.provider.counter += 1;
  }
}
```
