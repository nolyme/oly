/**
 * Error Factory.
 */
export const errors = {
  alreadyStarted: () =>
    new Error(`Kernel has already been started. You should call Kernel#stop() before doing that`),
  envNotDefined: (name: string) =>
    new Error(`Env key '${name}' is required but not defined. Use "new Kernel({'${name}': 'xxx'})"`),
  injectableIsNull: () =>
    new Error(`You are trying to inject a null object. This isn't allowed`),
  isNotFunction: (name: string, type: string) =>
    new Error(`Your '${name}' key must be a Function/ES6 Class. Current is '${type}'`),
  noDepAfterStart: (name: string) =>
    new Error(`Declaration of '${name}' isn't allowed after the Kernel#start(). Register it before starting kernel`),
  noDepUpdate: (name: string) =>
    new Error(`You are trying to update '${name}', which is an already-declared dependency`),
  notStarted: () =>
    new Error(`Kernel isn't started. You should call Kernel#start() before doing that`),
  reflectRequired: () =>
    new Error(
      `MetadataUtil requires 'reflect-metadata' polyfill. ` +
      `Use 'import "reflect-metadata";' on the top of your main script`),
};
