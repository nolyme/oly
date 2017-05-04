# o*l*y mapper

```ts
import { field, ObjectMapper } from "oly-mapper";

class Data {
  @field() text: string;
}

const oly = new ObjectMapper();
const dat = {text: "Hello"};

oly.schema(Credentials)        // -> JsonSchema
oly.parse(Credentials, dat);   // -> Data { text: "Hello"; }
oly.validate(Credentials, {}); // -> BOOM!

```

## Installation

```bash
$ npm install oly-core oly-mapper
```
