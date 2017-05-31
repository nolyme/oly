/**
 * oly-core error messages.
 */
export const olyCoreErrors = {

  alreadyStarted: () =>
    `Kernel has already been started. You should call Kernel#stop() before doing that`,

  defaultException: () =>
    `An exception has been thrown without any message`,

  envNotDefined: (name: string) =>
    `Env key '${name}' is required but not defined. Use "new Kernel({'${name}': 'xxx'})"`,

  injectableIsNull: () =>
    `You are trying to inject a null object. This isn't allowed`,

  isNotFunction: (name: string, type: string) =>
    `Your '${name}' key must be a Function/ES6 Class. Current is '${type}'`,

  noDepAfterStart: (name: string = "Unknown") =>
    `Declaration of '${name}' isn't allowed after the Kernel#start(). Register it before starting kernel`,

  noDepUpdate: (name: string) =>
    `You are trying to update '${name}', which is an already-declared dependency`,

  notStarted: () =>
    `Kernel isn't started. You should call Kernel#start() before doing that`,
};
