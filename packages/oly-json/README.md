# o*l*y json

o*l*y json is a module of the [o*l*y project](https://nolyme.github.io/oly).

```ts
import { Kernel } from "oly";
import { field, Json } from "oly-json";

class Data {
  @field name: string;
}

const kernel = Kernel.create();
const json = kernel.get(Json);

json.schema(Data);                 // {properties: [{name: ...

json.build(Data, {name: "John"});  // Data { name: "John" }
json.build(Data, {fake: "John"});  // throw ValidationException (data should have required property 'name')
```

### Installation

```bash
$ npm install oly oly-json
```
