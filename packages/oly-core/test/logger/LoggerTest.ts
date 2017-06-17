import { deepEqual } from "assert";
import { olyCoreKeys } from "../../src/kernel/constants/keys";
import { inject } from "../../src/kernel/decorators/inject";
import { IInjectableMetadata } from "../../src/kernel/interfaces/injections";
import { Kernel } from "../../src/kernel/Kernel";
import { Logger } from "../../src/logger/Logger";
import { Meta } from "../../src/meta/Meta";

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

    const k = Kernel.create({
      APP_NAME: "TEST",
      LOGGER_LEVEL: "ERROR",
    });
    const a = k.inject(A);
    expect(a.logger["contextId"]).toBe(k.env("KERNEL_ID"));
    expect(a.logger["componentName"]).toBe("A");
    expect(a.logger["appName"]).toBe("TEST");
    expect(a.logger["logLevel"]).toBe("ERROR");
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

    const k = Kernel.create({
      APP_NAME: "TEST",
      LOGGER_LEVEL: "TRACE",
    });

    expect(FakeLogger.i).toBe(0);

    k.with({provide: Logger, use: FakeLogger});
    expect(FakeLogger.i).toBe(1);

    const a = k.inject(A);
    expect(FakeLogger.i).toBe(2);

    a.test();
    expect(FakeLogger.i).toBe(2);

    expect(a.logger["contextId"]).toBe(k.env("KERNEL_ID"));
    expect(a.logger["componentName"]).toBe("A");
    expect(a.logger["appName"]).toBe("TEST");
    expect(a.logger["logLevel"]).toBe("TRACE");

    const meta = Meta.of({key: olyCoreKeys.injectable, target: FakeLogger}).get<IInjectableMetadata>();
    const metaExtended = Meta.of({key: olyCoreKeys.injectable, target: FakeLogger}).deep<IInjectableMetadata>();

    expect(meta).toBeUndefined();
    expect(metaExtended!.target.singleton).toBeFalsy();

    deepEqual(stack, ["DEBUG1", "INFO2", "WARN3", "ERROR4"]);
  });
});
