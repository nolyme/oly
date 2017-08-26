import * as chalk from "chalk";

(chalk as any).enabled = true;

export class AnsiColor {

  public static html: any = require("ansi-html");

  public static chalk: any = chalk;

  public static toBrowser(text: string): string[] {
    return this.htmlToStyles(this.html(text));
  }

  public static clear(text: string): string {
    return this.chalk.stripColor(text);
  }

  public static isSupported(): boolean {
    return this.chalk.supportsColor;
  }

  public static htmlToStyles(...text: string[]): string[] {
    const argArray: string[] = [];

    if (arguments.length) {
      const startTagRe = /<span\s+style=(['"])([^'"]*)\1\s*>/gi;
      const endTagRe = /<\/span>/gi;

      let reResultArray;
      argArray.push(arguments[0].replace(startTagRe, "%c").replace(endTagRe, "%c"));

      // tslint:disable-next-line
      while (reResultArray = startTagRe.exec(arguments[0])) {
        argArray.push(reResultArray[2]);
        argArray.push("");
      }

      for (let j = 1; j < arguments.length; j++) {
        argArray.push(arguments[j]);
      }
    }

    return argArray;
  }
}
