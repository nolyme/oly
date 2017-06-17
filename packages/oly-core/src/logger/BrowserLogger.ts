import { Global } from "../kernel/Global";
import { AnsiColor } from "./AnsiColor";
import { Logger } from "./Logger";
import { ILogLevel } from "./LogLevels";

export class BrowserLogger extends Logger {

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
      if (Global.isBrowser() && this.hasColor) {
        output.apply(console, AnsiColor.toBrowser(text));
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
    const now = new Date().toLocaleTimeString();
    return ""
      + "[" + now + "] "
      + AnsiColor.chalk[this.colors[type]](type) + " "
      + AnsiColor.chalk.bold(this.componentName + ":") + " "
      + ("\"" + message + "\" ")
      + (!!data ? "\n" + JSON.stringify(data, null, "  ") : "");
  }
}
