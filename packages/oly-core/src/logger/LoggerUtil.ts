import * as chalk from "chalk";

(chalk as any).enabled = true;

export class LoggerUtil {

  public static toHtml(text: string): string {
    return require("ansi-html")(text);
  }

  public static logStyles(...args: string[]): void {
    const argArray = [];

    if (args.length) {
      const startTagRe = /<span\s+style=(['"])([^'"]*)\1\s*>/gi;
      const endTagRe = /<\/span>/gi;

      let reResultArray;
      argArray.push(args[0].replace(startTagRe, "%c").replace(endTagRe, "%c"));
      while (reResultArray = startTagRe.exec(args[0])) { // tslint:disable-line
        argArray.push(reResultArray[2]);
        argArray.push("");
      }

      // pass through subsequent args since chrome dev tools does not (yet) support console.log
      // styling of the following form: console.log('%cBlue!', 'color: blue;', '%cRed!', 'color: red;');
      for (let j = 1; j < args.length; j++) {
        argArray.push(args[j]);
      }
    }

    console.log.apply(console, argArray);
  }
}
