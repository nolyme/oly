import { injectable } from "../decorators/injectable";
import { IClass } from "../interfaces/types";
import { Kernel } from "../Kernel";
import { Logger } from "./Logger";

/**
 * Swap logger with Muted for hide messages.
 */
@injectable({
  provide: Logger,
  use: (kernel: Kernel, parent: IClass) => {
    const name = (!!parent && typeof parent.name === "string") ? parent.name : Logger.DEFAULT_NAME;
    return new MutedLogger(kernel.id, name);
  },
})
export class MutedLogger extends Logger {

  protected appender() {
    return null;
  }

  protected format() {
    return "";
  }
}
