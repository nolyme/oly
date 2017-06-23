/**
 * oly-core error messages.
 */
export const olyCoreErrors = {

  envNotDefined: (name: string) =>
    `Env key '${name}' is required but not defined. Use "new Kernel({'${name}': 'xxx'})"`,

  injectableIsNull: () =>
    `You are trying to inject a null object. This isn't allowed`,

  isNotFunction: (name: string, type: string) =>
    `Your '${name}' key must be a Function/ES6 Class. Current is '${type}'`,

  noDepAfterStart: (name: string = "Unknown") =>
    `Declaration of '${name}' isn't allowed after Kernel#start(). Register it before starting kernel`,

  noDepUpdate: (name: string) =>
    `You are trying to update '${name}', which is an already-declared dependency`,
};
