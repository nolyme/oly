import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { env, inject, Logger } from "oly";
import { Json } from "oly-json";
import { resolve } from "path";
import { Application, ProjectReflection } from "typedoc";
import { IDocs, IModuleContent } from "../../shared/interfaces";
import { Configuration } from "../models/Configuration";
import { ModuleConfiguration } from "../models/ModuleConfiguration";
import { DocParser } from "../services/DocParser";

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
    const webpackContext = resolve(__dirname + "/../../../");
    const webpackConfig = webpackContext + "/webpack.config.js";
    const webpackPath = resolve(__dirname + "/../../../node_modules/.bin/webpack");
    const configPath = resolve(this.cwd, "docs.json");
    const config = this.json.build(Configuration, readFileSync(configPath, "UTF-8"));
    const output = resolve(this.cwd, this.out);
    const modules: IModuleContent[] = [];
    const command = `${webpackPath} --env.NODE_ENV=production --env.LOGGER_LEVEL=ERROR --output-path=${output} `
      + `--config=${webpackConfig} --context=${webpackContext} ${webpackArgv} --hide-modules`;

    // build webpack (this is not cached)
    if (this.html) {
      this.logger.trace(command);
      this.logger.info("run webpack...");
      execSync(command, {stdio: [0, 1, 2]});
      this.logger.info("webpack ok");
    }

    this.logger.info(`use ${resolve("tsconfig.json")}`);

    const app = new Application({
      logger: "none",
      ignoreCompilerErrors: true,
      tsconfig: resolve("tsconfig.json"),
    });

    let files: any[] = [];
    for (const m of config.modules) {
      const src = resolve(this.cwd, this.root, m.name, this.src);
      files = files.concat([
        ...m.decorators,
        ...m.components,
        ...m.exceptions,
        ...m.services,
      ].map((i) => src + "/" + i.replace(/\.tsx?/mgi, "")));
    }

    this.logger.info(`run typedoc... (${files.length} files)`);
    const reflection: ProjectReflection = app.convert(files);

    // create metadata
    for (const m of config.modules) {
      modules.push(this.create(resolve(this.cwd, this.root, m.name), m, app, reflection));
      this.logger.debug(`module ${m.name} is created`);
    }

    const doc: IDocs = {
      home: this.parser.mark(readFileSync(resolve(this.cwd, "README.md"), "UTF-8")),
      modules,
      name: config.name,
      version: "",
    };

    // produce .js
    this.logger.info(`write docs.js`);
    writeFileSync(resolve(output, "docs.js"), "window.__DOCS__=" + JSON.stringify(doc) + ";");

    this.logger.info(`doc generation is done`);
  }

  private create(project: string, m: ModuleConfiguration,
                 app: Application, reflection: ProjectReflection): IModuleContent {

    const pkg = require(resolve(project, "package.json"));
    const sources = resolve(project, this.src);

    this.logger.info(`add module ${m.name}`);

    return {
      version: pkg.version,
      decorators: this.parser.generateDecorator(app, sources, m, reflection),
      interfaces: [],
      components: this.parser.generateComponents(app, sources, m, reflection),
      exceptions: this.parser.generateException(app, sources, m, reflection),
      manuals: this.parser.generateManuals(app, project, m.manuals),
      env: this.parser.generateEnv(app, sources, m.services, reflection),
      home: this.parser.mark(readFileSync(resolve(project, "README.md"), "UTF-8")),
      icon: m.icon,
      name: m.name,
      services: this.parser.generateService(app, sources, m, reflection),
    };
  }
}
