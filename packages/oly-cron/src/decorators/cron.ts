import { IDecorator, Meta } from "oly-core";
import { olyCronKeys } from "../constants/keys";


export class CronDecorator implements IDecorator {

  public constructor(private cron: string) {
  }

  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    Meta.of({key: olyCronKeys.schedulers, target, propertyKey}).set({
      cron: this.cron,
    });
  }
}

export const cron = Meta.decoratorWithOptions<string>(CronDecorator);
