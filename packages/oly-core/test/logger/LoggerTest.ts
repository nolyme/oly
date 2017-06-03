import { deepEqual } from "assert";
import { Meta } from "../../src/decorator/Meta";
import { olyCoreKeys } from "../../src/kernel/constants/keys";
import { inject } from "../../src/kernel/decorators/inject";
import { IInjectableMetadata } from "../../src/kernel/interfaces/injections";
import { Logger } from "../../src/logger/Logger";
import { createKernel } from "../helpers";

describe("Logger", () => {

  it("should append strings", () => {
    const stack: string[] = [];

    class FakeLogger extends Logger {
      appender(type: string, msg: string) {
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

    const k = createKernel({
      OLY_APP_NAME: "TEST",
      OLY_LOGGER_LEVEL: "ERROR",
    });
    const a = k.get(A);
    expect(a.logger["contextId"]).toBe(k.env("OLY_KERNEL_ID"));  // tslint:disable-line
    expect(a.logger["componentName"]).toBe("A");  // tslint:disable-line
    expect(a.logger["appName"]).toBe("TEST");    // tslint:disable-line
    expect(a.logger["logLevel"]).toBe("ERROR");  // tslint:disable-line
  });
  it("should be swappable", () => {
    const stack: string[] = [];

    class FakeLogger extends Logger {

      static i = 0;

      constructor(parent: any) {
        super(parent);
        FakeLogger.i++;
      }

      appender(type: string, msg: string) {
        return stack.push(msg);
      }

      format(type: string, msg: string, dat: any) {
        return type + msg;
      }
    }

    class A {
      @inject logger: Logger;

      test() {
        this.logger.debug("1");
        this.logger.info("2");
        this.logger.warn("3");
        this.logger.error("4");
      }
    }

    const k = createKernel({
      OLY_APP_NAME: "TEST",
      OLY_LOGGER_LEVEL: "TRACE",
    });

    expect(FakeLogger.i).toBe(0);

    k.with({provide: Logger, use: FakeLogger});
    expect(FakeLogger.i).toBe(1);

    const a = k.get(A);
    expect(FakeLogger.i).toBe(2);

    a.test();
    expect(FakeLogger.i).toBe(2);

    expect(a.logger["contextId"]).toBe(k.env("OLY_KERNEL_ID"));  // tslint:disable-line
    expect(a.logger["componentName"]).toBe("A");                // tslint:disable-line
    expect(a.logger["appName"]).toBe("TEST");             // tslint:disable-line
    expect(a.logger["logLevel"]).toBe("TRACE");  // tslint:disable-line

    const meta = Meta.of({key: olyCoreKeys.injectable, target: FakeLogger}).get<IInjectableMetadata>();
    const metaExtended = Meta.of({key: olyCoreKeys.injectable, target: FakeLogger}).deep<IInjectableMetadata>();

    expect(meta).toBeUndefined();
    expect(metaExtended!.target.singleton).toBeFalsy();

    deepEqual(stack, ["DEBUG1", "INFO2", "WARN3", "ERROR4"]);
  });
});
