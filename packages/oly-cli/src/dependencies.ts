import { existsSync } from "fs";
import { resolve } from "path";
import { which } from "shelljs";
import { spawnExecutable } from "./constants";

export type IDep = string | { name: string; dev: boolean };

export const addDependencies = (deps: string[], dev: boolean = false): void => {
  if (which("yarn")) {
    spawnExecutable("yarn", ["add", dev ? "-D" : "", ...deps]);
  } else {
    spawnExecutable("npm", ["install", dev ? "-D" : "-S", ...deps]);
  }
};

export const addDevDependencies = (deps: string[]): void => addDependencies(deps, true);

export const ensureDependencies = (deps: IDep[] = []): void => {
  const listOfDevDeps = [];
  const listOfDeps = [];
  for (const dep of deps) {
    const name = typeof dep === "string" ? dep : dep.name;
    if (!existsSync(resolve(process.cwd(), "node_modules", name))) {
      if (typeof dep === "string") {
        listOfDevDeps.push(name);
      } else {
        listOfDeps.push(name);
      }
    }
  }
  if (listOfDevDeps.length) {
    addDevDependencies(listOfDevDeps);
  }
  if (listOfDeps.length) {
    addDependencies(listOfDeps);
  }
};
