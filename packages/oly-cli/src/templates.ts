import { existsSync, readFileSync, writeFileSync } from "fs";
import { cp } from "shelljs";
import { pkgPath, root } from "./constants";
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
  ensureDependencies(["typescript", {name: "oly-core", dev: false}, "oly-tools", "webpack", "webpack-dev-server"]);
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
  ensureDependencies(["typescript", {name: "oly-core", dev: false}, "ts-node"]);
  copyFiles("project");
  copyFiles("server");
  mergePackageJson({
    scripts: {
      start: "src/main.server.ts",
    },
  });
};

export const initTest = () => {
  ensureDependencies(["typescript", "tslint", "jest", "@types/jest", "ts-jest"]);
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
