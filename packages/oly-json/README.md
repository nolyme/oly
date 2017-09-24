# o*l*y json

JSON Schema with decorators to map and validate data.

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
json.build(Data, {fake: "John"});  // throw ValidationException
```

## Installation

```bash
$ npm install oly oly-json
```

## Dependencies

|  |  |
|--|--|
| JSON-Schema Validator | [ajv](https://github.com/epoberezkin/ajv) |
