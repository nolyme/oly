import { injectable } from "../kernel/decorators/injectable";
import { Logger } from "./Logger";
import { ILogLevel, LogLevels } from "./LogLevels";

/**
 * Display {json: message} instead of classic format.
 *
 * ```ts
 * kernel.with(JsonLogger);
 * ```
 */
@injectable({
  provide: Logger,
  singleton: false,
})
export class JsonLogger extends Logger {

  protected log(type: ILogLevel, message: string, data?: object) {
    if (LogLevels[this.logLevel] <= type) {
      this.appender(type, this.format(type, message, data));
    }
  }

  protected appender(type: string, message: any) {
    console.log.apply(console, [Logger.ansi.strip(message)]);
  }

  protected format(type: string, message: string, data?: object) {
    const log: any = {
      dat: new Date().toISOString(),
      lvl: type,
      app: this.appName,
      ctx: this.contextId,
      dep: this.componentName,
      msg: message,
    };
    if (data) {
      log.ext = data;
    }
    return JSON.stringify(log);
  }
}
