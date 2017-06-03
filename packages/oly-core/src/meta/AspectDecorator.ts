import { olyCoreKeys } from "../kernel/constants/keys";
import { Kernel } from "../kernel/Kernel";
import { IAspectParameter, IDecorator } from "./interfaces";
import { Meta } from "./Meta";

/**
 *
 */
export abstract class AspectDecorator implements IDecorator {

  public abstract asProxy(parameter: IAspectParameter): void;

  public asMethod(t: any, p: string, i: TypedPropertyDescriptor<any>): void {
    const action = i.value;
    const self = this;

    Meta.of({
      key: olyCoreKeys.injections,
      target: t,
      propertyKey: "__kernel__",
    }).set({
      type: Kernel,
    });

    i.value = function oly$proxy(this: any) {
      let response;
      let done = false;
      const trigger = (valid?: boolean) => {
        done = true;
        if (valid !== false) {
          response = action.apply(this, arguments);
        }
      };
      self.asProxy({
        kernel: this.__kernel__,
        call: trigger,
        target: t.constructor,
        propertyKey: p,
        arguments: Array.from(arguments),
      });
      if (!done) {
        trigger();
      }
      return response;
    };
  }
}
