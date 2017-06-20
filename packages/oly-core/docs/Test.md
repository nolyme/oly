### Jest

There is a wonderful tool called [jest](https://facebook.github.io/jest/).

- fast
- coverage
- browser and server
- async/await
- typescript (with ts-jest)

```bash
$ npm i -D jest ts-jest @types/jest
```

#### Example

```ts
describe("A", () => {

  // when NODE_ENV=test, Kernel.create() runs 
  // Kernel#start() on beforeAll()
  // and Kernel#stop() on afterAll()
  // + logger level is set to ERROR by default
  
  const k = Kernel.create({
    "A": "B",
  });
  
  // inject regular service
  const s = k.inject(Service);
  
  it("should be ok", () => {
  
    expect(k.state("A")).toBe("B");
  });
});
```
