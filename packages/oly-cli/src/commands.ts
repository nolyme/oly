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
        cmds.forEach((cmd) => cmd.exec && cmd.exec(args));
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
  "tsc": {
    help: "exec tsc",
    exec: (args: string[]) => spawnExecutable(getLocalBinary("tsc"), args),
  },
  "ts-node": {
    exec: (args: string[]) => spawnExecutable(getLocalBinary("ts-node"), args),
  },
  "jest": {
    exec: (args: string[]) => spawnExecutable(getLocalBinary("jest"), args),
  },
  "webpack": {
    exec: (args: string[]) => spawnExecutable(getLocalBinary("webpack"), args),
  },
  "webpack-dev-server": {
    exec: (args: string[]) => spawnExecutable(getLocalBinary("webpack-dev-server"), args),
  },
  "help": {
    help: "show this message",
    exec: (args: string[]) => showHelp(commands),
  },
};
