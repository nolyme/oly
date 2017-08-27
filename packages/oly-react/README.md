# o*l*y react

o*l*y react is a module of the [o*l*y project](https://nolyme.github.io/oly).

```ts
import { Kernel } from "oly";
import { page, ReactServerProvider } from "oly-react";
import * as React from "react";

class ReactApp {

  @page
  index() {
    return <h1>Hello World</h1>
  }
}

Kernel
  .create({HTTP_SERVER_PORT: 5000})
  .with(ReactApp, ReactServerProvider)
  .start()
  .catch(console.error);
```

### Installation

```bash
$ npm install oly oly-react react @types/react
```

### Why

- use Kernel and @inject/@env/@on in React components
- embedded router (using history + path-to-regex)
- server side rendering
- cache between server/browser


#### Kernel in React

```ts
import { inject, Kernel } from "oly";
import { AppContext } from "oly-react";
import * as React from "react";
import { render } from "react-dom";

class App extends React.Component {
  @inject kernel: Kernel;

  render() {
    return <h1>{this.kernel.id}</h1>
  }
}

const kernel = Kernel.create();
render(
  <AppContext kernel={kernel}><App/></AppContext>,
  document.getElementById("app"));
```

#### Server Side Rendering

```ts
// app.tsx
import { page } from "oly-react";

class App {
  @page home() {
    return <div>Hi</div>
  }
}

// main.browser.ts
import { Kernel } from "oly";
import { ReactBrowserProvider } from "oly-react";

Kernel
  .create()
  .with(App, ReactBrowserProvider)
  .start()
  .catch(console.error)
  
  
// main.server.ts
import { Kernel } from "oly";
import { ReactServerProvider } from "oly-react";

Kernel
  .create({REACT_SERVER_POINTS: ["www"]}) // webpack build directory
  .with(App, ReactServerProvider)
  .start()
  .catch(console.error)
```
