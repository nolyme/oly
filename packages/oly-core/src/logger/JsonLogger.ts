import { injectable } from "../decorators/injectable";
import { IClass } from "../interfaces/types";
import { Kernel } from "../Kernel";
import { Logger } from "./Logger";
import { LogLevels } from "./LogLevels";

/**
 * Display {json: message} instead of classic format.
 *
 * ```typescript
 * kernel.with(JsonLogger);
 * ```
 */
@injectable({
  provide: Logger,
  singleton: false,
  use: (kernel: Kernel, parent: IClass) => {
    const name = (!!parent && typeof parent.name === "string") ? parent.name : Logger.DEFAULT_NAME;
    return new JsonLogger(kernel.id, name);
  },
})
export class JsonLogger extends Logger {

  public error(message: any, data?: object) {
    if (LogLevels[this.logLevel] <= LogLevels.ERROR) {
      this.appender(this.format("ERROR", message, data));
    }
  }

  protected format(type: string, message: string, data?: object) {
    return `{"date":"${new Date().toISOString()}","lvl":"${type}","app": "${this.appName}", `
      + `"ctx":"${this.contextId}","dep":"${this.componentName}", "msg":"${message}"`
      + (!!data ? `,"ext":${JSON.stringify(data)}}` : "}");
  }
}
