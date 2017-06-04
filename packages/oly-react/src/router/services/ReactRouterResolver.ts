import { _, inject, Kernel, Logger } from "oly-core";
import { createElement } from "react";
import { Layer } from "../components/Layer";
import { IChunks, ITransition } from "../interfaces";

export class ReactRouterResolver {

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  /**
   * Invoke a function and try to map the result in chunks.
   *
   * @param transition    Current transition to parse
   * @param index         Level in the stack of the resolve
   */
  public async resolve(transition: ITransition, index: number): Promise<IChunks | undefined> {

    const target = transition.to.route.stack[index].target;
    const propertyKey = transition.to.route.stack[index].propertyKey;

    this.logger.trace("resolve " + _.identity(target, propertyKey));

    let raw = await this.kernel.invoke(target, propertyKey, [transition, index]);

    this.logger.trace("resolve " + _.identity(target, propertyKey) + " OK");

    // nothing is allowed, this will block the transition
    if (!raw) {
      return;
    }

    if (typeof raw === "function") {
      raw = {main: createElement(raw)};
    } else if (typeof raw === "object") {
      if (raw["$$typeof"]) { // tslint:disable-line
        raw = {main: raw};
      } else {
        for (const key of Object.keys(raw)) {
          raw[key] = typeof raw[key] === "function"
            ? createElement(raw[key])
            : raw[key];
        }
      }
    } else {
      raw = {main: createElement("div", {}, raw)};
    }

    for (const key of Object.keys(raw)) {
      raw[key] = createElement(Layer, {id: index + 1}, raw[key]);
    }

    return raw;
  }
}
