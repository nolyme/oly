# Stringify

Serialization works with a regular [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

```ts
import { Kernel } from "oly";
import { Json, field } from "oly-json";

class Data {
  @field name: string;
  
  // ECMAScript standard
  toJSON() {
    return {
      name: this.name.toUpperCase(),  
    }
  }
}

const json = Kernel.create().get(Json);
const data = json.build(Data, {name: "Jean"});

json.stringify(data);
// same
JSON.stringify(data);
```
