## TODO

### SOON

- (oly-docs): split module (api & react)
- (oly-docs): add more and more and more docs. **[IN PROGRESS]**
- (oly-*) use `/__tests__/`
- (oly-*) better coverage, especially react-router... :)
- (oly-react/router) scroll top:0 on route change
- [HARD] (oly-amqp) amqp @retry
- [HARD] (oly-amqp) memory (test!)
- [HARD] (oly-orm): use objection.js + knex + oly-json
- (oly-json): @check/@val, and replace @body check
  - wrap @body, and check the response !
  - @val(IField) :))))
  
### THOUGHTS

- (oly-react/router) lazy loading TS2.4 + import()
- (oly-react/pixie) pixie auto route
- (oly-react/pixie) Cookie.get() Cookie.set(), cookie sec
- (oly-cli): init --ssr
- (oly-amqp): cron no time dependency + Time
- [HARD] (oly-ws): init

### MAYBE ONE DAY

- (oly-*): es5 delivery
- (oly-json): store
- (oly-orm): rest
- (oly-api): hal resource
- (oly-orm): pagination Page
- (oly-*): use "oly" pkg

## LIST

- core   : kernel         di, store, event emitter in one class
- core   : exception      exception template with cause and toJSON
- core   : time           time wrapper
- core   : metadata       reflect metadata wrapper
- core   : logger         logger interface
- react  : context        kernel into react
- react  : router         custom router based on layers and resolves
- react  : server         easy server side rendering
- react  : pixie          session, cache, http-client for ssr
- http   : http           axios wrapper, koa wrapper
- json   : mapper         transform json to object
- json   : validate       ajv wrapper
- api    : core           koa wrapper for REST api
- api    : router         route metadata
- api    : security       auth, token, crypto
- api    : swagger        swagger spec, ui
- tools  : webpack        webpack conf factory
- amqp   : amqp           amqp client
- amqp   : cron           cron provider
