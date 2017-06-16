import { env } from "../kernel/decorators/env";
import { injectable } from "../kernel/decorators/injectable";
import { parent } from "../kernel/decorators/parent";
import { state } from "../kernel/decorators/state";
import { _ } from "../kernel/Global";
import { Class } from "../kernel/interfaces/injections";
import { ILogLevel, LogLevels } from "./LogLevels";

/**
 * Main oly logger
 */
@injectable({
  singleton: false,
})
export class Logger {

  public static DEFAULT_NAME = "Component";

  public static ansi = require("ansicolor");

  public static supportsColor = require("supports-color");

  /**
   * Used by Logger.ansi.
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
  protected appName: string = "App";

  /**
   * Set the level of your logger.
   */
  @env("OLY_LOGGER_LEVEL")
  protected logLevel: ILogLevel = "INFO";

  /**
   * Enable or disable color.
   */
  @env("OLY_LOGGER_COLOR")
  protected hasColor: boolean = true;

  /**
   *
   */
  @state("OLY_KERNEL_ID")
  protected contextId: string = "";

  /**
   *
   */
  protected componentName: string = Logger.DEFAULT_NAME;

  /**
   *
   * @param parent
   */
  public constructor(@parent parent?: Class) {
    if (parent) {
      this.componentName = parent.name;
    }
  }

  /**
   * Change the componentName after instantiation.
   * ```
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
   * Output.
   *
   * @param type
   * @param text
   */
  protected appender(type: ILogLevel, text: string | Error): void {

    if (type === "TRACE") {
      type = "DEBUG";
    }

    const output = console[type.toLowerCase()] || console.log;

    if (text instanceof Error) {
      output.apply(console, [text]);
    } else {
      if (Logger.supportsColor && this.hasColor) {
        output.apply(console, [text]);
      } else if (_.isBrowser() && this.hasColor) {
        output.apply(console, Logger.ansi.parse(text).asChromeConsoleLogArguments);
      } else {
        output.apply(console, [Logger.ansi.strip(text)]);
      }
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
    const now = _.isBrowser() ? new Date().toLocaleTimeString() : new Date().toLocaleString();
    return ""
      + "[" + now + "] "
      + Logger.ansi[Logger.colors[type]](type) + " "
      + (!_.isBrowser()
        ? Logger.ansi.bright(this.appName + "(") + this.contextId + Logger.ansi.bright(")") + " "
        : "")
      + Logger.ansi.bright(this.componentName + ":") + " "
      + Logger.ansi.italic("\"" + message + "\" ")
      + (!!data ? "\n" + JSON.stringify(data, null, "  ") : "");
  }
}
