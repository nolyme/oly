# o*l*y orm

https://github.com/typeorm/typeorm

```ts
import { Kernel } from "oly";
import { id, column, Repository } from "oly-orm";

class Article {
  @id() id: number;
  @column() title: string;
}

class ArticleRepository extends Repository.of(Article) {
}

const k = Kernel.create({DATABASE_URL: ":memory:"});
const a = k.get(ArticleRepository);

await k.start();
await a.insert({title: "Hi!"});
```
