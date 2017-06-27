
There is many ways to handle authentication client-side.
Most of the time, you need to define a login system.

Based on your business needs:

#### All services require auth

So, all the pages too.

```ts
class MyAdminApp {
  @inject session: Session;

  @layout root() {
    // doing that is dangerous but easy,
    // you really create 2 application,
    // because root() is never updated during transition
    // use `router.reload()` after a login
    return this.session.exists()
     ? <Layout/>
     : <Login/>
  }

  @page home() {
    return <Home/>
  }
}
```

This is hardcore.
