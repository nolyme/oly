import { IDecorator } from "../../meta/interfaces";
import { Meta } from "../../meta/Meta";
import { olyCoreKeys } from "../constants/keys";
import { Class, IFactory } from "../interfaces/injections";

export interface IInjectableOptions {
  singleton?: boolean;
  use?: IFactory<any>;
  provide?: Class<any>;
}

export class InjectableDecorator implements IDecorator {

  private options: IInjectableOptions;

  public constructor(options: IInjectableOptions) {
    this.options = options;
  }

  public asClass(t: Function): void {
    Meta.of({key: olyCoreKeys.injectable, target: t}).set(this.options);
  }
}

/**
 * Service configuration decorator.
 */
export const injectable = Meta.decoratorWithOptions<IInjectableOptions>(InjectableDecorator);
