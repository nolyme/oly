import { Logger } from "./Logger";
import { ILogLevel, LogLevels } from "./LogLevels";

/**
 * Display {json: message} instead of classic format.
 *
 * ```ts
 * kernel.with({provide: Logger, use: JsonLogger});
 * ```
 */
export class JsonLogger extends Logger {

  protected log(type: ILogLevel, message: string, data?: object) {
    if (LogLevels[this.logLevel] <= LogLevels[type]) {
      this.appender(type, this.format(type, message, data));
    }
  }

  protected appender(type: string, text: string) {
    console.log.apply(console, [text]);
  }

  protected format(type: string, message: string, data?: object) {

    const log: any = {
      now: new Date().toISOString(),
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
