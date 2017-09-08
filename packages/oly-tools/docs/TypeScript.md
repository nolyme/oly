### Install

```bash
$ npm install oly
$ npm install -D typescript
```

### Config

/tsconfig.json

https://www.typescriptlang.org/docs/handbook/tsconfig-json.html 

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es5",
    "sourceMap": true,
    
    // oly requirements
    "jsx": "react",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "lib": [
      "es5",
      "es2015.promise",
      "dom"
    ]
  },
  "exclude": [
    "node_modules"
  ]
}
```

