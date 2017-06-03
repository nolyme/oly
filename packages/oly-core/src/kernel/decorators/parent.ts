import { IDecorator } from "../../meta/interfaces";
import { Meta } from "../../meta/Meta";
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
 * Argument decorator: get the parent.
 */
export const parent = Meta.decoratorWithoutOptions(ParentDecorator);
