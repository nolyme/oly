import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { env, inject, Logger } from "oly-core";
import { Json } from "oly-json";
import { resolve } from "path";
import { Application } from "typedoc";
import { DocParser } from "./DocParser";
import { IDocs, IModuleContent } from "./interfaces";
import { Configuration } from "./models/Configuration";
import { ModuleConfiguration } from "./models/ModuleConfiguration";

export class DocProvider {

  // where to scan docs
  @env("CWD") private cwd: string = process.cwd();

  // run webpack ?
  @env("HTML") private html: boolean = true;

  // internal conf, shouldn't be updated
  @env("ROOT") private root: string = "packages";
  @env("SRC") private src: string = "src";
  @env("OUT") private out: string = "docs";

  @inject private logger: Logger;
  @inject private parser: DocParser;
  @inject private json: Json;

  public async onStart() {
    const webpackArgv = process.argv.slice(2).join(" ");
    const webpackContext = resolve(__dirname + "/../../");
    const webpackConfig = webpackContext + "/webpack.config.js";
    const webpackPath = resolve(__dirname + "/../../node_modules/.bin/webpack");
    const configPath = resolve(this.cwd, "docs.json");
    const config = this.json.build(Configuration, readFileSync(configPath, "UTF-8"));
    const output = resolve(this.cwd, this.out);
    const modules: IModuleContent[] = [];
    const command = `${webpackPath} --output-path=${output} `
      + `--config=${webpackConfig} --context=${webpackContext} ${webpackArgv}`;

    // build webpack (this is not cached)
    if (this.html) {
      this.logger.trace(command);
      this.logger.info("run webpack...");
      try {
        execSync(command);
      } catch (e) {
        throw new Error(`Webpack has failed (${e.message})`);
      }
      this.logger.info("webpack ok");
    }

    // create metadata
    for (const m of config.modules) {
      modules.push(this.create(resolve(this.cwd, this.root, m.name), m));
      this.logger.debug(`module ${m.name} is created`);
    }
    const doc: IDocs = {
      home: this.parser.mark(readFileSync(resolve(this.cwd, "README.md"), "UTF-8")),
      modules,
      name: config.name,
      version: "",
    };

    // produce .js
    this.logger.info(`write as js`);
    writeFileSync(resolve(output, "docs.js"), "window.__DOCS__=" + JSON.stringify(doc) + ";");

    this.logger.info(`everything is great, have a nice day`);
  }

  private create(project: string, m: ModuleConfiguration): IModuleContent {

    const app = new Application({
      logger: "none",
      ignoreCompilerErrors: true,
      tsconfig: resolve(project, "tsconfig.json"),
    });
    const sources = resolve(project, this.src);

    this.logger.info(`add module ${m.name}`);

    return {
      decorators: this.parser.generateDecorator(app, sources, m),
      interfaces: [],
      components: this.parser.generateComponents(app, sources, m),
      manuals: this.parser.generateManuals(app, project, m.manuals),
      env: this.parser.generateEnv(app, sources, m.services),
      home: this.parser.mark(readFileSync(resolve(project, "README.md"), "UTF-8")),
      icon: m.icon,
      name: m.name,
      services: this.parser.generateService(app, sources, m),
    };
  }
}
