import { IDecorator } from "../../decorator/interfaces";
import { Meta } from "../../decorator/Meta";
import { olyCoreKeys } from "../constants/keys";
import { Class } from "../interfaces/injections";
import { Kernel } from "../Kernel";

export class ParentDecorator implements IDecorator {

  public asParameter(t: object, p: string, i: number): void {
    Meta.of({key: olyCoreKeys.arguments, target: t, propertyKey: p, index: i}).set({
      handler: (k: Kernel, [parent]: [Class]) => {
        return parent;
      },
    });
  }
}

/**
 *
 */
export const parent = Meta.decoratorWithoutOptions(ParentDecorator);
