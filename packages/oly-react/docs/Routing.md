# Routing

The embedded router is based on [history](https://www.npmjs.com/package/history) and [path-to-regex](https://www.npmjs.com/package/path-to-regexp).

## Page, Node, Route and Path.

In this example:

```ts
import { layout, View, ITransition, page } from "oly-react";

class MyController {

  @layout
  root() {
    return <View/>;
  }

  @page("/")
  index(tr: ITransition) {
    console.log(tr.from);   // old route
    console.log(tr.to);     // new route
    return <MyComponent/>;
  }
}
```

MyController has a **node** called *index*.
This node is defined by a **@page** decorator.

After Kernel#start(), this node will be mounted as **route** with path **"/"**.

```ts
router.go("/"); // by path
router.go("index"); // by node (not recommended)
router.go("root.index"); // by route
```

## Resolves and Actions

All resolves are asynchronous. 

```ts
class MyController {

  @page("/")
  async index() {
    const data = await fetch("/something"); 
    const MyComponent = await import("./MyComponent");
    return <MyComponent data={data}/>;
  }
}
```

## Redirection

When a resolve returns a promise of Transition(type=REPLACE), oly creates a redirection.

```ts
class MyController {

  @page("/")
  async index() {
    return this.router.go({to: "/", type: "REPLACE"});
  }
}
```

## Error, NotFound

```ts

export class MyErrorHandler {

  // define a route named "error" to catch transition errors
  @page error(tr: ITransitionError) {
    return <div>
      <pre>Error: {tr.error.message || String(e.error)}</pre>
    </div>
  }

  // use /* to handle "page not found"
  @page("/*") notFound(e: ITransition) {
    return <pre>Page Not Found</pre>
  }
}
```

