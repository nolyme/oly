import { AnsiColor } from "./AnsiColor";
import { Logger } from "./Logger";
import { ILogLevel } from "./LogLevels";

/**
 * Main oly logger
 */
export class ServerLogger extends Logger {

  /**
   * Output.
   *
   * @param type
   * @param text
   */
  protected appender(type: ILogLevel, text: string | Error): void {

    const output = console.log;

    if (text instanceof Error) {
      output.apply(console, [text]);
    } else {
      if (AnsiColor.isSupported() && this.hasColor) {
        output.apply(console, [text]);
      } else {
        output.apply(console, [AnsiColor.clear(text)]);
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
    return ""
      + "[" + new Date().toLocaleString() + "] "
      + AnsiColor.chalk[this.colors[type]](type) + " "
      + AnsiColor.chalk.bold(this.appName + "(") + this.contextId + AnsiColor.chalk.bold(")") + " "
      + AnsiColor.chalk.bold(this.componentName + ":") + " "
      + AnsiColor.chalk.italic("\"" + message + "\" ")
      + (!!data ? "\n" + JSON.stringify(data, null, "  ") : "");
  }
}
