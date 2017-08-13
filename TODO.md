## TODO

### Bug

- @action endless loop if processed twice (if will*Mount is called twice...)
- @state is always processed, even with {use: () => } which is fine, but not accepted if item is already processed
  -> check if processed, to define getter twice or allow override
- (oly-react): remove "react show views"
- (oly-react): @env in components (crash on #get)

### SOON

- (oly-core): kernel.on("before:process", ({definition, instance}) => {}) 
\--- (oly-react): @inject|state? -> @attach
- (oly-react): @action({prevent: true})
- (oly-react): @action({name: ''})
- (oly-react): @action -> @on
- (oly-json): Merge all into Json, no @inject, new Json()
- (oly-react): <Active></Active> update on transition end, set class if match /
- (oly-react): @attach({watch: [/** states | events **/]})
- (oly-react): @attach({styles: () => null | {}})
- (oly-tools): css source maps ?

### THOUGHTS

- (oly-*) better coverage, especially react-router ... :)
- (oly-core): no mutation before start options ?
- (oly): intellij auto import ... :( 
- (oly-docs): show env & exception in services/components
- (oly-react): transition-css, transition+reload
- (oly-*): IEnv ... :(
- (oly-cli): init --ssr
- (oly-fs): init, fs api+mock, workspace, tmp, sftp?/
- (oly-swagger): throws/response/...

### MAYBE ONE DAY

- (oly-docs): static method (Kernel.create) and getter property (Browser.window)
- (oly-docs): interfaces (popup) 
- (oly-api): hal resource
