import * as chalk from "chalk";
import { LoggerUtil } from "../../src/logger/LoggerUtil";

describe("LoggerUtil", () => {
  it("should transform chalk text to html", () => {
    expect(LoggerUtil.toHtml(chalk.red("Hello")))
      .toBe("<span style=\"color:#ff0000;\">Hello</span>");
  });
});
