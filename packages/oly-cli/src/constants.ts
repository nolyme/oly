import { spawnSync } from "child_process";
import { resolve } from "path";

export interface ICommands {
  [key: string]: {
    help?: string;
    alias?: string;
    ensure?: string[];
    exec?: (args: string[]) => void
  };
}

export const root = resolve(__dirname, "..");

export const pkgPath = process.cwd() + "/package.json";

export const getLocalBinary = (name: string) => resolve(process.cwd(), "node_modules/.bin/" + name);

export const spawnExecutable = (name: string, args: string[]): void => {
  spawnSync(name, args, {stdio: [null, process.stdout, process.stderr]});
};

export const log = (...msg: any[]) => console.log(msg); // tslint:disable-line

export const showHelp = (commands: ICommands) => {
  log("");
  for (const name of Object.keys(commands)) {
    if (commands[name].help) {
      log(`   ${name}: ${commands[name].help}`);
    }
  }
  log("");
};
