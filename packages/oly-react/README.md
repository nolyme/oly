# o*l*y react

o*l*y react is a module of the [o*l*y project](https://noly.me/oly).

## Installation

```bash
$ npm install oly-core oly-react react @types/react
```

## Why

- use Kernel and @inject/@env/@on in React components.
- provide a Router.
- make SSR easier.

```ts
import { page, layout, View } from "oly-react";

export class Application {

  @layout 
  root() {
    return (
      <div>
        <Menu/>
        <View/>
      </div>
    );
  }
  
  @page("/")
  home() {
    return <Home/>;
  }
}

```
