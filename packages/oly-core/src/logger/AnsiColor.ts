import * as chalk from "chalk";

(chalk as any).enabled = true;

export class AnsiColor {

  public static html: any = require("ansi-html");

  public static chalk = chalk;

  public static toBrowser(text: string): [string, string] {
    return [text, this.html(text)];
  }

  public static clear(text: string): string {
    return this.chalk.stripColor(text);
  }

  public static isSupported(): boolean {
    return this.chalk.supportsColor;
  }
}
