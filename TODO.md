## TODO

### SOON

- (oly-docs): split module (api & react)
- (oly-docs): middlewares
- (oly-docs): exceptions
- [HARD] (oly-docs): interfaces (popup)
- [HARD] (oly-docs): version
- (oly-docs): show env & exception in services/components
- (oly-docs): add more and more and more docs.
- (oly-docs): preprocess links on generated md before runtime.
- [HARD] (oly-*) better coverage, especially react-router... :)
- [HARD] (oly-amqp) amqp @retry
- [HARD] (oly-amqp) memory (for test!)
- [HARD] (oly-orm): use knex + oly-json
  
### THOUGHTS

- (oly-tools/cli): better ssr dev workflow (one process)
- (oly-react/router) base href
- (oly-react/pixie) pixie auto route
- (oly-react/pixie) Cookie.get() Cookie.set(), cookie sec
- (oly-cli): init --ssr
- (oly-react/router) scroll top:0 on route change
- (oly-amqp): cron no time dependency + Time
- [HARD] (oly-ws): init, websocket with @on and fork(onconnect)
- (oly-fs): init, fs api+mock, workspace, tmp
- (oly-*): tree shaking experiences

### MAYBE ONE DAY

- (oly-api): use qs with koa-router (and maybe, remove koa-router, just use koa-mount)
- (oly-orm): rest
- (oly-tools): hot reload
- (oly-api): hal resource
- (oly-orm): pagination Page
- (oly-*): use "oly" pkg

## LIST

- oly
  - oly-core
  - oly-api
  - oly-security
  - oly-swagger
  - oly-react
  - oly-react-ssr
  - oly-http
  - oly-json
  - oly-batch
  - oly-retry
  - oly-amqp   
  - oly-cron   
      
- core   : kernel         di, store, event emitter in one class
- core   : exception      exception template with cause and toJSON
- core   : time           time wrapper
- core   : metadata       reflect metadata wrapper
- core   : logger         logger interface
- react  : context        kernel into react
- react  : router         custom router based on layers and resolves
- react  : server         easy server side rendering
- react  : pixie          session, cache, http-client for ssr
- http   : http           axios wrapper, koa wrapper (bad)
- json   : mapper         transform json to object
- json   : validate       ajv wrapper
- api    : core           koa wrapper for REST api
- api    : router         route metadata
- api    : security       auth, token, crypto
- api    : swagger        swagger spec, ui
- tools  : webpack        webpack conf factory
- amqp   : amqp           amqp client
- amqp   : cron           cron provider
