# o*l*y orm

```typescript
import { Kernel } from "oly-core";
import { UserRepository, DatabaseProvider, id, column } from "oly-orm";

class User {
  @id() id: number;
  @column() name: string;
}

class UserRepository extends Repository.of(User) {
}

new Kernel({
  OLY_DATABASE_URL: "sqlite://sqlite.db"
})
  .with(UserRepository, DatabaseProvider)
  .start()
```

## Installation

```bash
$ npm install oly-core oly-orm
```

## Configuration

| ENV | Provider | Default | Description |
|-----|----------|---------|-------------|
| **OLY_DATABASE_URL** | DatabaseProvider  | - | Connection URL to Postgres, Sqlite, ...  |
