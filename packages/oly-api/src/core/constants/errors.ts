/**
 * oly-api error messages.
 *
 * ```ts
 * import { olyApiErrors } from "oly-api";
 * olyApiErrors.missing = (w, n) => "override message like that";
 * ```
 */
export const olyApiErrors = {

  badRequest: (): string =>
    `The request had bad syntax or was inherently impossible to be satisfied`,

  forbidden: (): string =>
    `Authentication was provided, but you are not permitted to perform the requested operation`,

  internalError: (): string =>
    `The server encountered an unexpected condition which prevented it from fulfilling the request`,

  invalidFormat: (type: string, key: string, expected: string): string =>
    `Invalid format. The ${type} '${key}' should be a ${expected}`,

  methodNotAllowed: (): string =>
    `The server has not found anything matching the URI given`,

  missing: (what: string, name: string): string =>
    `The ${what} '${name}' is missing`,

  notFound: (): string =>
    `The server has not found anything matching the URI given`,

  notImplemented: (): string =>
    `The server either does not recognize the request method, or it lacks the ability to fulfil the request`,

  serviceNotFound: (): string =>
    `The requested service does not exists`,

  unauthorized: (): string =>
    `The request requires user authentication`,

  undefinedAction: (actionName: string): string =>
    `Undefined action "${actionName}". Function isn't declared`,
};
