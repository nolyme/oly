### Router

The embedded router is based on [history](https://www.npmjs.com/package/history) and [path-to-regex](https://www.npmjs.com/package/path-to-regexp).

Public API is handle by:
- Router

Most of the logic is handle by:
- ReactRouterProvider

#### Page, Node, Route and Path.

In this example:

```ts
class MyController {

  @layout
  root() {
    return <View/>;
  }

  @page("/")
  index(tr: ITransition) {
    console.log(tr.from);
    console.log(tr.to);
    return <MyComponent/>;
  }
}
```

MyController has a **node** called *index*.
This node is defined by a **@page**.

After Kernel#start(), this node will be mounted as **route** with path **"/"**.

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
