const supportsColor = require("supports-color");
const ansiColor = require("ansicolor");

export class AnsiColor {

  public static isSupported(): boolean {
    return supportsColor;
  }

  public static clear(text: string): string {
    return ansiColor.strip(text);
  }

  public static toBrowser(text: string): string {
    return ansiColor.parse(text).asChromeConsoleLogArguments;
  }

  public static cyan(text: string): string {
    return ansiColor.cyan(text);
  }

  public static red(text: string): string {
    return ansiColor.red(text);
  }

  public static green(text: string): string {
    return ansiColor.green(text);
  }

  public static magenta(text: string): string {
    return ansiColor.magenta(text);
  }

  public static yellow(text: string): string {
    return ansiColor.yellow(text);
  }

  public static italic(text: string): string {
    return ansiColor.italic(text);
  }

  public static bright(text: string): string {
    return ansiColor.bright(text);
  }

  public static dim(text: string): string {
    return ansiColor.dim(text);
  }
}
