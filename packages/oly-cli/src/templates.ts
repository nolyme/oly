import { existsSync, readFileSync, writeFileSync } from "fs";
import { cp } from "shelljs";
import { ICommands, pkgPath, root } from "./constants";
import { ensureDependencies } from "./dependencies";

export const mergePackageJson = (newPkg: object) => {
  const pkg = existsSync(pkgPath)
    ? JSON.parse(readFileSync(pkgPath, "UTF-8"))
    : {};
  writeFileSync(pkgPath, JSON.stringify((Object as any).assign(pkg, newPkg), null, "  "), "UTF-8");
};

export const copyFiles = (type = "project"): void => {
  cp("-Rn", root + `/templates/${type}/*`, ".");
  if (type === "project") {
    cp("-Rn", root + `/templates/${type}/.*`, ".");
  }
};

export const initBrowser = (): void => {
  ensureDependencies(["typescript", {
    name: "oly-core",
    dev: false,
  }, "oly-tools", "ts-node", "webpack", "webpack-dev-server"]);
  copyFiles("project");
  copyFiles("browser");
  mergePackageJson({
    scripts: {
      build: "webpack",
      serve: "webpack-dev-server",
    },
  });
};

export const initBrowserReact = (): void => {
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
  copyFiles("browser-react");
  copyFiles("browser");
  mergePackageJson({
    scripts: {
      build: "webpack",
      serve: "webpack-dev-server",
    },
  });
};

export const initServer = (): void => {
  ensureDependencies(["typescript", {name: "oly-core", dev: false}, "ts-node"]);
  copyFiles("project");
  copyFiles("server");
  mergePackageJson({
    scripts: {
      start: "ts-node src/main.server.ts",
    },
  });
};

export const initServerApi = (): void => {
  ensureDependencies(["typescript",
    {name: "oly-core", dev: false},
    {name: "oly-mapper", dev: false},
    {name: "oly-http", dev: false},
    {name: "oly-api", dev: false},
    "ts-node"]);
  copyFiles("project");
  copyFiles("server-api");
  mergePackageJson({
    scripts: {
      start: "ts-node src/main.server.ts",
    },
  });
};

export const initTest = () => {
  ensureDependencies(["typescript", {name: "oly-core", dev: false}, "tslint", "jest", "@types/jest", "ts-jest"]);
  copyFiles("project");
  copyFiles("test");
  mergePackageJson({
    jest: {
      preset: "./jest.json",
    },
    scripts: {
      lint: "tslint",
      test: "jest",
    },
  });
};

export const initCommands: ICommands = {
  "--browser": {
    help: "simple browser file with webpack",
    exec: () => initBrowser(),
  },
  "--browser-react": {
    help: "simple react file",
    exec: () => initBrowserReact(),
  },
  "--server": {
    help: "simple server file",
    exec: () => initServer(),
  },
  "--server-api": {
    help: "simple api file",
    exec: () => initServerApi(),
  },
  "--test": {
    help: "tslint + simple test file with jest",
    exec: () => initTest(),
  },
};
