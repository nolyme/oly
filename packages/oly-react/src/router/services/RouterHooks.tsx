import { IAnyFunction, inject, Kernel } from "oly-core";
import * as React from "react";
import { RouterState } from "react-router";
import { TRANSITION_BEGIN, TRANSITION_FINISH } from "../constants";

/**
 * @experimental
 */
export class RouterHooks {

  @inject(Kernel)
  protected kernel: Kernel;

  protected stack = 0;

  /**
   * Last chance to render a react component when your app is broken.
   * ErrorHandler is async like @page handlers.
   *
   * There are several ways to make something cool:
   *
   * - parse error and return a adapted component (404, 401, 500...)
   * - force a back-to-home with replace('/')
   *
   * @param state
   * @param replace
   * @param error
   */
  public async errorHandler([state, replace, error]: [RouterState, IAnyFunction, Error]): Promise<any> {
    return (
      <div style={{padding: "50px"}}>
        <p>Looks like something went wrong!</p>
        <h4>{error.message}</h4>
        {!this.kernel.isProduction() && <pre>{error.stack}</pre>}
      </div>
    );
  }

  /**
   *
   * @param state
   */
  public $start(state: RouterState): void {
    if (this.stack <= 0) {
      this.kernel.emit(TRANSITION_BEGIN, state);
      this.stack = 1;
    } else {
      this.stack += 1;
    }
  }

  /**
   *
   * @param state
   */
  public $end(state: RouterState): void {
    this.stack -= 1;
    if (this.stack === 0) {
      setTimeout(() => {
        this.kernel.emit(TRANSITION_FINISH, state);
      });
    }
  }
}
