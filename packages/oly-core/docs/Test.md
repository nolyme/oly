### Jest

There is a wonderful tool called [jest](https://facebook.github.io/jest/).

- very fast
- coverage
- env browser/server
- async/await
- typescript (with ts-jest)

```bash
$ npm i -D jest ts-jest @types/jest
```

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
  const s = k.inject(Service);
  
  it("should be ok", () => {
  
  });
});
```
