/**
 * oly-api error messages.
 *
 * ```typescript
 * import { olyApiErrors } from "oly-api";
 * olyApiErrors.missing = (w, n) => "override message like that";
 * ```
 */
export const olyApiErrors = {

  badRequest: (): string =>
    `The request had bad syntax or was inherently impossible to be satisfied`,

  internalError: (): string =>
    `The server encountered an unexpected condition which prevented it from fulfilling the request`,

  invalidFormat: (type: string, key: string, expected: string): string =>
    `Invalid format. The ${type} '${key}' expects ${expected}`,

  missing: (what: string, name: string): string =>
    `Missing ${what} '${name}'`,

  notFound: (): string =>
    `The server has not found anything matching the URI given`,

  serviceNotFound: (): string =>
    `The requested service does not exists`,

  undefinedAction: (actionName: string): string =>
    `Undefined action "${actionName}". Function isn't declared`,

  validationHasFailed: (): string =>
    `Validation has failed`,
};
