# o*l*y react

o*l*y react is a module of the [o*l*y project](https://nolyme.github.io/oly).

### Installation

```bash
$ npm install oly oly-react react @types/react
```

### Why

- use Kernel and @inject/@env/@on in React components.
- provide a Router.
- make SSR easier.

```ts
import { Kernel } from "oly";
import { page, layout, View, ReactBrowserProvider } from "oly-react";

export class Application {

  @layout 
  root() {
    return (
      <div>
        <div>menu</div>
        <View/>
      </div>
    );
  }
  
  @page("/")
  home() {
    return <div>home</div>;
  }
}

Kernel
  .create()
  .with(Application, ReactBrowserProvider)
  .start()
  .catch(console.error)
```
