/**
 * oly-http error messages.
 */
export const olyHttpErrors = {

  internalError: (): string =>
    `The server encountered an unexpected condition which prevented it from fulfilling the request`,

  requestHasFailed: (method: string = "GET", url: string = "/", status: number = 500): string =>
    `Failed to fetch '${method} ${url}' (${status})`,

  requestHasFailedWithMessage: (method: string = "GET",
                                url: string = "/",
                                status: number = 500,
                                message: string): string =>
    `Failed to fetch '${method} ${url}' (${status}: ${message})`,
};
