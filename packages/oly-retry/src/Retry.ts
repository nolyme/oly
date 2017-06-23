import { inject, Logger } from "oly-core";
import { IRetryOptions } from "./interfaces";

export class Retry {

  @inject
  protected logger: Logger;

  /**
   * Retry n times an operation when [**].
   *
   * @param func
   * @param options
   */
  public operation<T>(func: () => T, options: IRetryOptions): T {

    const handleError = (e: Error): T => {
      let repeat = false;
      for (const w of options.when) {
        if (w instanceof RegExp) {
          if (e
            // accept only 'throw new Error("...")'
            // ignore 'throw "..."'
            && typeof e.message === "string"
            && w.test(e.message)) {
            repeat = true;
            break;
          }
        } else {
          if (e instanceof w) {
            repeat = true;
            break;
          }
        }
      }

      if (!repeat || options.attempts === 0) {
        throw e;
      }

      return this.operation(func, {
        ...options,
        attempts: options.attempts - 1,
      });
    };

    try {
      const response: any = func();
      if (response.then && response.catch) {
        return response.catch((e: Error) => handleError(e));
      }
      return response;
    } catch (e) {
      return handleError(e);
    }
  }
}
