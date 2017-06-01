import * as chalk from "chalk";
import { env } from "../kernel/decorators/env";
import { injectable } from "../kernel/decorators/injectable";
import { _ } from "../kernel/Global";
import { Kernel } from "../kernel/Kernel";
import { LogLevels } from "./LogLevels";

/**
 * Main oly logger
 */
@injectable({
  singleton: false,
  use: (kernel: Kernel, parent?: Function) => {
    return new Logger(kernel.id).as(parent ? parent.name : "");
  },
})
export class Logger {

  public static DEFAULT_NAME = "Unknown";

  /**
   * Used by this.chalk.
   */
  public static colors = {
    DEBUG: "cyan",
    ERROR: "red",
    INFO: "green",
    TRACE: "magenta",
    WARN: "yellow",
  };

  /**
   * Set a name to your app.
   */
  @env("OLY_APP_NAME")
  protected appName: string = "MyApp";

  /**
   * Set the level of your logger.
   */
  @env("OLY_LOGGER_LEVEL")
  protected logLevel: string = "INFO";

  protected componentName: string = Logger.DEFAULT_NAME;

  public constructor(protected contextId: string = "") {
  }

  /**
   * Change the componentName after instantiation.
   * ```
   * kernel.get(Logger).as('MyComponent');
   * ```
   *
   * @param componentName - Component name
   * @returns {Logger}
   */
  public as(componentName: string) {
    this.componentName = componentName;
    return this;
  }

  /**
   * Display trace (silly/verbose) message
   *
   * @param message   Message to log
   * @param data      Additional data
   */
  public trace(message: string, data?: object) {
    if (LogLevels[this.logLevel] <= LogLevels.TRACE) {
      this.appender(this.format("TRACE", message, data));
    }
  }

  /**
   * Display debug message
   *
   * @param message   Message to log
   * @param data      Additional data
   */
  public debug(message: string, data?: object) {
    if (LogLevels[this.logLevel] <= LogLevels.DEBUG) {
      this.appender(this.format("DEBUG", message, data));
    }
  }

  /**
   * Display info message
   *
   * @param message   Message to log
   * @param data      Additional data
   */
  public info(message: string, data?: object) {
    if (LogLevels[this.logLevel] <= LogLevels.INFO) {
      this.appender(this.format("INFO", message, data));
    }
  }

  /**
   * Display warning message
   *
   * @param message   Message to log
   * @param data      Additional data
   */
  public warn(message: string, data?: object) {
    if (LogLevels[this.logLevel] <= LogLevels.WARN) {
      if (data && data instanceof Error) {
        this.appender(this.format("WARN", message));
        this.appender("\n " + this.chalk.red(data.stack || "?") + " \n\n");
      } else {
        this.appender(this.format("WARN", message, data));
      }
    }
  }

  /**
   * Display error message
   *
   * @param message   Message to log
   * @param data      Additional data like Error
   */
  public error(message: string, data?: object) {
    if (LogLevels[this.logLevel] <= LogLevels.ERROR) {
      if (data && data instanceof Error) {
        this.appender(this.format("ERROR", message));
        this.appender("\n " + this.chalk.red(data.stack || "?") + " \n\n");
      } else {
        this.appender(this.format("ERROR", message, data));
      }
    }
  }

  /**
   * Output.
   *
   * @param text
   */
  protected appender(text: string): void {
    if (_.isBrowser()) {
      console.log(text); // tslint:disable-line
    } else {
      process.stdout.write(text + "\n");
    }
  }

  /**
   * Transform Type + Message + Data into a "log".
   *
   * @param type      Type of the log (INFO, WARN, ...)
   * @param message   Message to display
   * @param data      Extended data
   */
  protected format(type: string, message: string, data?: object): string {
    const now = new Date().toLocaleString();
    return ""
      + "[" + this.chalk.grey(now) + "] "
      + chalk[Logger.colors[type]](type) + " "
      + this.chalk.bold(this.appName + "(") + ""
      + this.contextId + this.chalk.bold(")") + " "
      + this.chalk.bold(this.componentName + ":") + " "
      + ("\"" + message + "\" ")
      + this.chalk.gray(!!data ? "\n" + JSON.stringify(data, null, "  ") : "");
  }

  /**
   * Chalk factory.
   */
  protected get chalk() {
    return chalk;
  }
}
