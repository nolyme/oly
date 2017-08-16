import { env, IDecorator, inject, on, state } from "oly-core";
import { action } from "./decorators/action";
import { attach } from "./decorators/attach";

export const autoAttach = () => {

  const setAttach = (instance: any) => {
    const target = instance.constructor;
    if (target && target.contextTypes && target.contextTypes.kernel) {
      return;
    }

    if (!target || !target.prototype || !target.prototype.render) {
      return;
    }

    attach()(target);
  };

  [inject, on, state, env].forEach((decorator: IDecorator) => {
    decorator["hooks"].beforeAsProperty.push(setAttach);
  });

  [action].forEach((decorator: IDecorator) => {
    decorator["hooks"].beforeAsMethod.push(setAttach);
  });
};
