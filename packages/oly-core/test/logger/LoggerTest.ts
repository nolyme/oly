import { deepEqual } from "assert";
import { Logger } from "../../src/logger/Logger";

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

    const logger = new FakeLogger("test", "Test");
    logger.debug("1");
    logger.info("2");
    logger.warn("3");
    logger.error("4");
    deepEqual(stack, ["INFO2", "WARN3", "ERROR4"]);
  });
});
