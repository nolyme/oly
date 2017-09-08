### Jest

```bash
$ npm install -D jest @types/jest ts-jest
```

### Config

https://github.com/kulshekhar/ts-jest 

### Files

```ts
describe("A", () => {

  // Kernel.create() will:
  // - run Kernel#start() during beforeAll()
  // - run Kernel#stop() during afterAll()
  // - set logger level to ERROR by default
  
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
