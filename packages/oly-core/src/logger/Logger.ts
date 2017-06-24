import { env } from "../kernel/decorators/env";
import { injectable } from "../kernel/decorators/injectable";
import { parent } from "../kernel/decorators/parent";
import { state } from "../kernel/decorators/state";
import { Class } from "../kernel/interfaces/injections";
import { ILogLevel, LogLevels } from "./LogLevels";

/**
 * Simple logger.
 */
@injectable({
  singleton: false,
})
export class Logger {

  /**
   * Used by Logger.ansi.
   */
  protected colors = {
    DEBUG: "cyan",
    ERROR: "red",
    INFO: "green",
    TRACE: "magenta",
    WARN: "yellow",
  };

  /**
   * Set a name to your app.
   */
  @env("APP_NAME")
  protected appName: string = "App";

  /**
   * Set the level of your logger.
   */
  @env("LOGGER_LEVEL")
  protected logLevel: ILogLevel = "INFO";

  /**
   * Enable or disable color.
   */
  @env("LOGGER_COLOR")
  protected hasColor: boolean = true;

  /**
   *
   */
  @state("KERNEL_ID")
  protected contextId: string = "";

  /**
   *
   */
  protected componentName: string = "Component";

  /**
   *
   */
  public constructor(@parent
                     protected parent?: Class) {
    if (this.parent && this.parent.name) {
      this.as(this.parent.name);
    }
  }

  /**
   * Change the componentName after instantiation.
   *
   * ```ts
   * kernel.inject(Logger).as('MyComponent');
   * ```
   *
   * @param componentName     Component name
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
    this.log("TRACE", message, data);
  }

  /**
   * Display debug message
   *
   * @param message   Message to log
   * @param data      Additional data
   */
  public debug(message: string, data?: object) {
    this.log("DEBUG", message, data);
  }

  /**
   * Display info message
   *
   * @param message   Message to log
   * @param data      Additional data
   */
  public info(message: string, data?: object) {
    this.log("INFO", message, data);
  }

  /**
   * Display warning message
   *
   * @param message   Message to log
   * @param data      Additional data
   */
  public warn(message: string, data?: object) {
    this.log("WARN", message, data);
  }

  /**
   * Display error message
   *
   * @param message   Message to log
   * @param data      Additional data like Error
   */
  public error(message: string, data?: object) {
    this.log("ERROR", message, data);
  }

  /**
   *
   * @param type
   * @param message
   * @param data
   */
  protected log(type: ILogLevel, message: string, data?: object) {
    if (LogLevels[this.logLevel] <= LogLevels[type]) {
      if (data && data instanceof Error) {
        this.appender(type, this.format(type, message));
        this.appender(type, data);
      } else {
        this.appender(type, this.format(type, message, data));
      }
    }
  }

  /**
   * Default appender.
   *
   * @param type  Log level
   * @param text  Message
   */
  protected appender(type: ILogLevel, text: string | Error): void {
    console.log.apply(console, [text]);
  }

  /**
   * Transform Type + Message + Data into a "log".
   *
   * @param type      Type of the log (INFO, WARN, ...)
   * @param message   Message to display
   * @param data      Extended data
   */
  protected format(type: string, message: string, data?: object): string {
    return type.toLowerCase() + ": " + message;
  }
}
