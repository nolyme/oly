# o*l*y mongo

```ts
import { Kernel } from "oly";
import { Document, Repository } from "oly-mongo";

class UserDocument extends Document {
  @field email: string;
  @field password: string;
}

class UserRepository extends Repository.of(UserDocument) {
}

const kernel = Kernel.create();
const users = kernel.get(Repository);
await kernel.start();
await users.save({email: "...", password: "..."});
```
