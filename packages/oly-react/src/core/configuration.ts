import { env, inject, on, state } from "oly";
import { action } from "./decorators/action";
import { attach } from "./decorators/attach";

/**
 * use @inject/on/state/env on React.Component will also set @attach.
 */
export const autoAttach = () => {

  const setAttach = (instance: any) => {
    const target = instance.constructor;

    if (!target || !target.prototype || !target.prototype.render) {
      return;
    }

    attach()(target);
  };

  [inject, state, env].forEach((decorator: any) => {
    decorator["hooks"].beforeAsProperty.push(setAttach);
  });

  [action, on].forEach((decorator: any) => {
    decorator["hooks"].beforeAsMethod.push(setAttach);
  });
};
