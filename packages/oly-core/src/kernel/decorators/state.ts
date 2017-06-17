import { IDecorator } from "../../metadata/interfaces";
import { Meta } from "../../metadata/Meta";
import { olyCoreKeys } from "../constants/keys";
import { _ } from "../Global";
import { Kernel } from "../Kernel";

export class StateDecorator implements IDecorator {

  public constructor(private name: string) {
  }

  public asProperty(t: object, p: string): void {
    Meta.of({key: olyCoreKeys.states, target: t, propertyKey: p}).set({
      readonly: false,
      name: this.name,
      type: Meta.designType(t, p),
    });
  }

  public asParameter(t: object, p: string, i: number): void {
    Meta.of({key: olyCoreKeys.arguments, target: t, propertyKey: p, index: i}).set({
      handler: (k: Kernel) => {
        return k.state(this.name || _.identity(t.constructor, p));
      },
    });
  }
}

/**
 * Store accessor decorator.
 */
export const state = Meta.decorator<string>(StateDecorator);
