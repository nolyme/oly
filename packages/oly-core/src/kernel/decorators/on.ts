import { IDecorator } from "../../meta/interfaces";
import { Meta } from "../../meta/Meta";
import { olyCoreKeys } from "../constants/keys";

export class OnDecorator implements IDecorator {

  public constructor(private name: string) {
  }

  public asMethod(t: object, p: string): void {
    Meta.of({key: olyCoreKeys.events, target: t, propertyKey: p}).set({
      name: this.name,
    });
  }

  public asProperty(t: object, p: string): void {
    this.asMethod(t, p);
  }
}

/**
 * Event listener decorator.
 */
export const on = Meta.decorator<string>(OnDecorator);
