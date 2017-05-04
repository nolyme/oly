# o*l*y cron

```ts
import { Kernel } from "oly-core";
import { CronProvider, cron } from "oly-cron";

class App {

  @cron("* * * * * *")
  again() {
    console.log("Hello");
  }
}

new Kernel()
  .with(App, CronProvider)
  .start();
```

## Installation

```bash
$ npm install oly-core oly-cron
```

## Configuration

| ENV | Provider | Default | Description |
|-----|----------|---------|-------------|
| **OLY_CRON_TIMEZONE** | CronProvider | "" | This will modify the actual time relative to your timezone.  |
