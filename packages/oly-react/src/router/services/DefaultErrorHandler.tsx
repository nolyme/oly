import * as React from "react";
import { page } from "../decorators/page";
import { ITransition, ITransitionError } from "../interfaces";

/**
 * This is a controller with only an error handler.
 */
export class DefaultErrorHandler {

  /**
   * When a resolve fail (http error?), this function is used.
   * That's because his name is "error".
   * We can override this function by adding another "error" node.
   *
   * More important, blocking is also allowed here: if you return nothing, you block the transition! (don't do that)
   */
  @page
  public error(e: ITransitionError): JSX.Element {
    return (
      <div>
        <pre>Error: {e.error.message || String(e.error)}</pre>
      </div>
    );
  }

  /**
   * Default 404, this is required to avoid matching-exceptions during the transition.
   */
  @page("/*")
  public notFound(e: ITransition): JSX.Element {
    return (
      <pre>Page Not Found</pre>
    );
  }
}
