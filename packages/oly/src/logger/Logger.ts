import { env } from "../kernel/decorators/env";
import { injectable } from "../kernel/decorators/injectable";
import { parent } from "../kernel/decorators/parent";
import { state } from "../kernel/decorators/state";
import { Class } from "../kernel/interfaces/injections";
import { ILogLevel, LogLevels } from "./LogLevels";

/**
 * Default logger. This class acts like an interface.
 *
 * ### Levels
 *
 * **TRACE** < **DEBUG** < **INFO** *(default)* < **WARN** < **ERROR**.
 *
 * ```ts
 * Kernel
 *   .create({LOGGER_LEVEL: "TRACE"})
 *   .get(Logger)
 *   .as("Test")
 *   .trace("Hello!");
 * ```
 *
 * ### Override
 *
 * ```ts
 * class MyLogger extends Logger {
 *   // #log(type, text)
 *   // #format(type, text)
 *   // #appender(type, text)
 * }
 *
 * Kernel.create().with({provide: Logger, use: MyLogger});
 * ```
 *
 * ### Implementations
 *
 * There are some "built-in" loggers.
 *
 *
 * `ServerLogger`, with AnsiColor *(default on NodeJS)*
 * ```
 * [2017-9-3 19:09:52] INFO App(xx57yrab0z1) Kernel: "kernel has been successfully started"
 * ```
 *
 * `BrowserLogger`, with AnsiColor + CSS converter *(default on browsers)*
 * ```
 * [19:10:13] INFO Kernel: "kernel has been successfully started"
 * ```
 *
 * `JsonLogger`
 * ```
 * {"now":"2017-09-03T17:12:17.121Z","lvl":"INFO","app":"App","ctx":"xx57yrab0z1","dep":"Kernel","msg":"."}
 * ```
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
   * TRACE < DEBUG < INFO < WARN < ERROR
   */
  @env("LOGGER_LEVEL")
  protected logLevel: string = "INFO";

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
                     protected owner?: Class) {
    if (this.owner && this.owner.name) {
      this.as(this.owner.name);
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
    if (LogLevels[this.logLevel.toUpperCase()] <= LogLevels[type.toUpperCase()]) {
      if (data && data instanceof Error) {
        this.appender(type, this.format(type, message));
        this.appender(type, data);
      } else {
        this.appender(type, this.format(type, message));
        if (data) {
          this.appender(type, data);
        }
      }
    }
  }

  /**
   * Default appender.
   *
   * @param type  Log level
   * @param text  Message
   */
  protected appender(type: ILogLevel, text: string | Error | object): void {
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
