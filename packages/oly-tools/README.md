# o*l*y tools

### Installation

```bash
yarn add --dev oly-tools typescript ts-node webpack webpack-dev-server nodemon
cp -R node_modules/oly-tools/files/* node_modules/oly-tools/files/.* .
```

#### package.json
```json
{
  // ...
  "scripts": {
    "clean": "rm -rf www lib",
    "start": "NODE_ENV=production node lib/server.js",
    "build": "NODE_ENV=production webpack && npm run compile",
    "compile": "tsc",
    "server": "ts-node -F src/server.ts",
    "client": "webpack",
    "client:watch": "webpack-dev-server",
    "server:watch": "nodemon --exec 'ts-node -F' -e ts,tsx src/server.ts"
  }
  // ...
}
```
