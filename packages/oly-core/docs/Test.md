### Test

There is a wonderful tool called [jest](https://facebook.github.io/jest/).

- very fast
- coverage
- browser/server
- async/await
- typescript (with ts-jest)

#### Example

```ts
describe("A", () => {

  // when NODE_ENV=test, Kernel.create() binds 
  // Kernel#start() to beforeAll()
  // and Kernel#stop() to afterAll()
  // 
  
  const k = Kernel.create({
    // set ENV here,
    // like OLY_DATABASE_URL: ":memory:"
  });
  
  // inject regular service
  const s = k.get(Service);
 
  // mock
  k.with({
    provide: HttpClient,
    use: class extends HttpClient {
      request() {
        return {};
      }
    }
  })
  
  it("should be ok", () => {
  
  });
});
```
