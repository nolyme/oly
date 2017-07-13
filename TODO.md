## TODO

### Bug

- @action endless loop if processed twice (if willMount is called twice...)

### SOON

- (oly-core): start is very slow when > 100 els (~1sec)
- (oly-react): PureComponent everywhere
- (oly-react): one *$$refresh func by comp?
- (oly-core): no mutation before start
- (oly-json): JsonPath.get JsonPath.set (lodash.get like)
- 'toto(@build @body body: Type)' is very ugly
 -> auto @build when body
- (oly): auto import ... :( 
- integr test
- (oly-docs): middlewares
- (oly-docs): static method (Kernel.create) and getter property (Browser.window)
- (oly-docs): show env & exception in services/components
- (oly-*) better coverage, especially react-router ... :)
  
### THOUGHTS

- (oly-react): transition-css, transition+reload
- (oly-*): IEnv ... :(
- (oly-orm): use knex + oly-json {HARD}
- (oly-cli): init --ssr
- (oly-fs): init, fs api+mock, workspace, tmp, sftp
- (oly-swagger): throws/response/...
- (oly-docs): interfaces (popup) 

### MAYBE ONE DAY

- (oly-orm): rest
- (oly-api): hal resource
- (oly-orm): pagination Page
- (oly-docs): multi version
