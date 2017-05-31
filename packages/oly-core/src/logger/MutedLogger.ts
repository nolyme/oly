import { injectable } from "../kernel/decorators/injectable";
import { Kernel } from "../kernel/Kernel";
import { Logger } from "./Logger";

/**
 * Swap logger with Muted for hide messages.
 */
@injectable({
  provide: Logger,
  use: (kernel: Kernel, parent: Function) => {
    return new MutedLogger(kernel.id).as(parent ? parent.name : "");
  },
})
export class MutedLogger extends Logger {

  protected appender() {
    return null;
  }
}
