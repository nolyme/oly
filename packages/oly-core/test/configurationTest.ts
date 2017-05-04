import { equal } from "assert";
import { USE_NODE_ENV, USE_PROCESS_ENV } from "../src/configuration";
import { Kernel } from "../src/Kernel";

describe("USE_PROCESS_ENV()", () => {
  it("should use global process.env", () => {

    process.env.OLY_LOGGER_LEVEL = "ERROR";
    process.env.HELLO = "ERROR";

    const kernel = new Kernel({OLY_LOGGER_LEVEL: "DEBUG", HELLO: "WORLD"}).configure(USE_PROCESS_ENV);

    equal(kernel.env("OLY_LOGGER_LEVEL"), "ERROR");
    equal(kernel.env("HELLO"), "ERROR");
  });
});

describe("USE_NODE_ENV()", () => {
  it("should use global NODE_ENV", () => {
    process.env.NODE_ENV = "production";
    const kernel = new Kernel().configure(USE_NODE_ENV);
    equal(kernel.isProduction(), true);
    process.env.NODE_ENV = "watwat";
    const kernel2 = new Kernel().configure(USE_NODE_ENV);
    equal(kernel2.isProduction(), false);
  });
});
