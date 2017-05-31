import { IDecorator } from "../../decorator/interfaces";
import { Meta } from "../../decorator/Meta";
import { olyCoreKeys } from "../constants/keys";
import { IAnyFunction, IClassOf, IFactoryOf } from "../interfaces/global";

export interface IInjectableOptions {
  singleton?: boolean;
  use?: IFactoryOf<any>;
  provide?: IClassOf<any>;
}

export class InjectableDecorator implements IDecorator {

  private options: IInjectableOptions;

  public constructor(options: IInjectableOptions) {
    this.options = options;
  }

  public asClass(t: IAnyFunction): void {
    Meta.of({key: olyCoreKeys.injectable, target: t}).set(this.options);
  }
}

export const injectable = Meta.decoratorWithOptions<IInjectableOptions>(InjectableDecorator);
