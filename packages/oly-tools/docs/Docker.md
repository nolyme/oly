
### Example

/src/main.ts

```ts
import { Kernel } from "oly";
import { ApiProvider } from "oly-api";
import { Ctrl } from "./Ctrl";

Kernel
  .create(process.env)
  .with(ApiProvider, Ctrl)
  .start()
  .catch(console.error);
```

### Config

/Dockerfile

```docker
# CONTAINER
FROM node:8.1-alpine
RUN mkdir -p /app
WORKDIR /app

# DEPENDENCIES
COPY package.json yarn.lock /app/
RUN yarn --prod

# SOURCES
COPY lib /app/lib/
COPY www /app/www/

# CONFIGURATION
ENV NODE_ENV=production
ENV HTTP_SERVER_HOST=0.0.0.0
ENV HTTP_SERVER_PORT=3000

# RUN
EXPOSE 3000
CMD [ "npm", "start" ]
```
