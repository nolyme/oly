import { getLocalBinary, ICommands, showHelp, spawnExecutable } from "./constants";
import { initBrowser, initServer, initTest } from "./templates";

export const commands: ICommands = {
  "init": {
    help: "create a new project",
    exec: (args: string[]) => {
      if (args[0] === "--server") {
        initServer();
      } else if (args[0] === "--test") {
        initTest();
      } else if (args[0] === "--browser") {
        initBrowser();
      } else {
        initServer();
        initTest();
        initBrowser();
      }
    },
  },
  "run": {
    help: "exec ts-node",
    alias: "ts-node",
  },
  "test": {
    help: "exec jest",
    alias: "jest",
  },
  "build": {
    help: "exec webpack",
    alias: "webpack",
  },
  "serve": {
    help: "exec webpack-dev-server",
    alias: "webpack-dev-server",
  },
  "lint": {
    help: "exec tslint",
    exec: (args: string[]) => spawnExecutable(getLocalBinary("tslint"), [...args, "src/**/*"]),
  },
  "tsc": {
    help: "exec tsc",
    ensure: ["typescript"],
    exec: (args: string[]) => spawnExecutable(getLocalBinary("tsc"), args),
  },
  "ts-node": {
    ensure: ["typescript", "ts-node"],
    exec: (args: string[]) => spawnExecutable(getLocalBinary("ts-node"), args),
  },
  "tslint": {
    ensure: ["typescript", "tslint"],
    exec: (args: string[]) => spawnExecutable(getLocalBinary("tslint"), args),
  },
  "jest": {
    ensure: ["typescript", "jest", "@types/jest", "ts-jest"],
    exec: (args: string[]) => spawnExecutable(getLocalBinary("jest"), args),
  },
  "webpack": {
    ensure: ["typescript", "oly-tools", "webpack"],
    exec: (args: string[]) => spawnExecutable(getLocalBinary("webpack"), args),
  },
  "webpack-dev-server": {
    ensure: ["typescript", "oly-tools", "webpack", "webpack-dev-server"],
    exec: (args: string[]) => spawnExecutable(getLocalBinary("webpack-dev-server"), args),
  },
  "help": {
    help: "show this message",
    exec: (args: string[]) => showHelp(commands),
  },
};
