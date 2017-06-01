import { IDecorator } from "../../decorator/interfaces";
import { Meta } from "../../decorator/Meta";
import { olyCoreKeys } from "../constants/keys";
import { Kernel } from "../Kernel";
import { _ } from "../Global";

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

export const state = Meta.decorator<string>(StateDecorator);
