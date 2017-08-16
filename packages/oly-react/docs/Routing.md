### Router

The embedded router is based on [history](https://www.npmjs.com/package/history) and [path-to-regex](https://www.npmjs.com/package/path-to-regexp).

Public API is handle by:
- Router

Most of the logic is handle by:
- ReactRouterProvider

The main state is:
- REACT_ROUTER_PROVIDER_MATCH

#### Page, Node, Route and Path.

In this example:

```ts
class MyController {

  @layout
  root() {
    return <View/>;
  }

  @page("/")
  index() {
    return <MyComponent/>;
  }
}
```

MyController has a **node** called *index*.
This node is defined by a **@page**.

After Kernel#start(), this node will be mounted as **route** with path **"/"**.

So, you can make a **transition** to this page with:
```ts
router.go("/"); // by path
router.go("index"); // by node (not recommended)
router.go("root.index"); // by route
```

#### Resolves and Actions

All pages can be asynchronous. 

Most of the time, you fetch some data and THEN you create the component.

```ts
class MyController {

  @page("/")
  async index() {
    // this is a resolve
    const data = await fetch("/something"); 
    return <MyComponent data={data}/>;
  }
}
```

#### Redirection

You can use a "REPLACE" inside a resolve. 
This act like a real redirection.

```ts
class MyController {

  @page("/")
  async index() {
    return this.router.go({to: "/", type: "REPLACE"});
  }
}
```
