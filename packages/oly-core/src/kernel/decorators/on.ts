import { IDecorator } from "../../decorator/interfaces";
import { Meta } from "../../decorator/Meta";
import { olyCoreKeys } from "../constants/keys";

export class OnDecorator implements IDecorator {

  public constructor(private name: string) {
  }

  public asMethod(t: object, p: string): void {
    Meta.of({key: olyCoreKeys.events, target: t, propertyKey: p}).set({
      name: this.name,
    });
  }
}

export const on = Meta.decorator<string>(OnDecorator);
