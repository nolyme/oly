import { deepEqual } from "assert";
import { inject } from "../../src/kernel/decorators/inject";
import { Logger } from "../../src/logger/Logger";
import { createKernel } from "../helpers";

describe("Logger", () => {
  it("should append strings", () => {
    const stack: string[] = [];

    class FakeLogger extends Logger {
      appender(msg: string) {
        return stack.push(msg);
      }

      format(type: string, msg: string, dat: any) {
        return type + msg;
      }
    }

    const logger = new FakeLogger();
    logger.debug("1");
    logger.info("2");
    logger.warn("3");
    logger.error("4");
    deepEqual(stack, ["INFO2", "WARN3", "ERROR4"]);
  });
  it("should be injectable", () => {
    class A {
      @inject logger: Logger;
    }

    const a = createKernel({
      OLY_APP_NAME: "TEST",
      OLY_LOGGER_LEVEL: "ERROR",
    }).get(A);
    expect(a.logger["componentName"]).toBe("A");  // tslint:disable-line
    expect(a.logger["appName"]).toBe("TEST");    // tslint:disable-line
    expect(a.logger["logLevel"]).toBe("ERROR");  // tslint:disable-line
  });
});
