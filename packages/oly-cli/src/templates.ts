import { existsSync, readFileSync, writeFileSync } from "fs";
import { Global } from "oly-core";
import { cp } from "shelljs";
import { ICommands, pkgPath, root } from "./constants";
import { ensureDependencies } from "./dependencies";

export const mergePackageJson = (newPkg: object) => {
  const pkg = existsSync(pkgPath)
    ? JSON.parse(readFileSync(pkgPath, "UTF-8"))
    : {};
  writeFileSync(
    pkgPath,
    JSON.stringify(Global.merge(pkg, newPkg), null, "  "),
    "UTF-8");
};

export const copyFiles = (type = "project"): void => {
  cp("-Rn", root + `/templates/${type}/*`, ".");
  if (type === "project") {
    cp("-Rn", root + `/templates/${type}/.*`, ".");
  }
};

export const initBrowser = (): void => {
  ensureDependencies([
    "typescript",
    {name: "oly-core", dev: false},
    {name: "oly-react", dev: false},
    {name: "@types/react", dev: false},
    {name: "react", dev: false},
    "oly-tools",
    "ts-node",
    "webpack",
    "webpack-dev-server",
  ]);
  copyFiles("project");
  copyFiles("browser");
  mergePackageJson({
    scripts: {
      build: "webpack",
      serve: "webpack-dev-server",
    },
  });
};

export const initServer = (): void => {
  ensureDependencies([
    "typescript",
    {name: "oly-core", dev: false},
    {name: "oly-json", dev: false},
    {name: "oly-api", dev: false},
    "nodemon",
    "ts-node",
  ]);
  copyFiles("project");
  copyFiles("server");
  mergePackageJson({
    scripts: {
      watch: "nodemon -e ts,tsx -x 'ts-node -F' src/main.server.ts",
      compile: "tsc",
    },
  });
};

export const initTest = () => {
  ensureDependencies([
    "typescript",
    {name: "oly-core", dev: false},
    "jest",
    "@types/jest",
    "ts-jest",
  ]);
  copyFiles("project");
  copyFiles("test");
  mergePackageJson({
    jest: {
      preset: "./jest.json",
    },
    scripts: {
      test: "jest",
    },
  });
};

export const initCommands: ICommands = {
  "--client": {
    help: "simple browser file with react/webpack",
    exec: () => initBrowser(),
  },
  "--server": {
    help: "simple server file with koa",
    exec: () => initServer(),
  },
  "--test": {
    help: "simple test file with jest",
    exec: () => initTest(),
  },
};
