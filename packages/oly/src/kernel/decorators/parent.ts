import { IDecorator } from "../../metadata/interfaces";
import { Meta } from "../../metadata/Meta";
import { olyCoreKeys } from "../constants/keys";
import { Class } from "../interfaces/injections";
import { Kernel } from "../Kernel";

export class Parent {
}

export class ParentDecorator implements IDecorator {

  public asProperty(t: object, p: string): void {
    Meta.of({key: olyCoreKeys.injections, target: t, propertyKey: p}).set({
      type: Parent,
    });
  }

  public asParameter(t: object, p: string, i: number): void {
    Meta.of({key: olyCoreKeys.arguments, target: t, propertyKey: p, index: i}).set({
      handler: (k: Kernel, [parent2]: [Class]) => {
        return parent2;
      },
    });
  }
}

/**
 * Argument decorator: get the parent.
 */
export const parent = Meta.decoratorWithoutOptions(ParentDecorator);
