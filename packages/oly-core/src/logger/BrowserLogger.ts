import { injectable } from "../kernel/decorators/injectable";
import { Logger } from "./Logger";

@injectable({
  provide: Logger,
})
export class BrowserLogger extends Logger {

  ansi = require("ansicolor");

  appender(text: string, type: string) {
    if (type === "TRACE") {
      type = "DEBUG";
    }
    const output = console[type.toLowerCase()] || console.log;
    output.apply(console, this.ansi.parse(text).asChromeConsoleLogArguments);
  }

  format(type: string, message: string, data?: object): string {
    const now = new Date().toLocaleTimeString();
    return ""
      + "[" + this.ansi.dim(now) + "] "
      + this.ansi[Logger.colors[type]](type) + " "
      + this.ansi.bright(this.componentName + ":") + " "
      + this.ansi.italic("\"" + message + "\" ")
      + this.ansi.dim(!!data ? "\n" + JSON.stringify(data, null, "  ") : "");
  }
}
