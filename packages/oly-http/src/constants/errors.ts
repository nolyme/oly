/**
 * oly-http error messages.
 */
export const olyHttpErrors = {

  internalError: (): string =>
    `The server encountered an unexpected condition which prevented it from fulfilling the request`,

  requestHasFailed: (method: string = "GET", url: string = "/"): string =>
    `Failed to fetch ${method} ${url}`,
};
