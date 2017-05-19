import { getLocalBinary, ICommands, showHelp, spawnExecutable } from "./constants";
import { initCommands } from "./templates";

export const commands: ICommands = {
  "init": {
    help: "create a new project",
    exec: (args: string[]) => {
      const cmds = args
        .map((arg) => initCommands[arg])
        .filter((cmd) => !!cmd && !!cmd.exec);
      if (cmds.length > 0) {
        cmds.forEach((cmd) =>
          cmd.exec && cmd.exec(args));
      } else {
        showHelp(initCommands);
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
    ensure: ["typescript", "oly-tools", "ts-node", "webpack"],
    exec: (args: string[]) => spawnExecutable(getLocalBinary("webpack"), args),
  },
  "webpack-dev-server": {
    ensure: ["typescript", "oly-tools", "ts-node", "webpack", "webpack-dev-server"],
    exec: (args: string[]) => spawnExecutable(getLocalBinary("webpack-dev-server"), args),
  },
  "help": {
    help: "show this message",
    exec: (args: string[]) => showHelp(commands),
  },
};
