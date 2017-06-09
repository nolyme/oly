import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { env, inject, Logger } from "oly-core";
import { JsonService } from "oly-json";
import { resolve } from "path";
import { Application, ProjectReflection } from "typedoc";
import { DeclarationReflection } from "typedoc/dist/lib/models";
import { DocBuilder } from "./DocBuilder";
import { DocParser } from "./DocParser";
import { IDocDecorator, IDocEnv, IDocs, IDocService, IModuleContent } from "./interfaces";
import { Configuration } from "./models/Configuration";
import { ModuleConfiguration } from "./models/ModuleConfiguration";

export class DocProvider {

  @env("CWD") private cwd: string = process.cwd();
  @env("HTML") private html: boolean = false;
  @env("DIRECTORY_ROOT") private root: string = "packages";
  @env("DIRECTORY_SRC") private src: string = "src";
  @env("DIRECTORY_OUT") private out: string = "docs";

  @inject private logger: Logger;
  @inject private parser: DocParser;
  @inject private builder: DocBuilder;
  @inject private jsonService: JsonService;

  public async onStart() {

    const webpackConfig = resolve(__dirname + "/../../webpack.config.ts");
    const webpackPath = resolve(__dirname + "/../../node_modules/.bin/webpack");
    const configPath = resolve(this.cwd, "docs.json");
    const config = this.jsonService.build(Configuration, readFileSync(configPath, "UTF-8"));
    const output = resolve(this.cwd, this.out);
    const modules: IModuleContent[] = [];
    const pkg = require(resolve(this.cwd, "package.json"));
    const command = `${webpackPath} --output-path=${output} --env=production --config=${webpackConfig}`;

    //execSync(command, {stdio: [0, 1, 2]});

    for (const m of config.modules) {
      modules.push(this.create(resolve(this.cwd, this.root, m.name), m));
      this.logger.debug(`module ${m.name} is created`);
    }

    const doc: IDocs = {
      home: this.parser.mark(readFileSync(resolve(this.cwd, "README.md"), "UTF-8")),
      modules,
      name: pkg.name,
      version: pkg.version,
    };

    this.logger.debug(`write as js`);
    writeFileSync(resolve(output, "docs.js"), "window.DOCS = " + JSON.stringify(doc), "UTF-8");
    this.logger.debug(`everything is great, have a nice day`);
  }

  private create(project: string, m: ModuleConfiguration): IModuleContent {

    const app = new Application({
      logger: "none",
      tsconfig: resolve(project, "tsconfig.json"),
    });
    const sources = resolve(project, this.src);

    this.logger.info(`add module ${m.name}`);

    return {
      decorators: this.generateDecorator(app, sources, m.decorators),
      interfaces: [],
      env: this.generateEnv(app, sources, m.services),
      home: this.parser.mark(readFileSync(resolve(project, "README.md"), "UTF-8")),
      icon: m.icon,
      name: m.name,
      services: this.generateService(app, sources, m.services),
    };
  }

  private generateDecorator(app: Application, path: string, results: string[]): IDocDecorator[] {
    this.logger.debug("check decorators");
    const declarations = this.generateDeclarations(app, path, results);

    return declarations
      .map((i) => i.children[i.children.length - 1])
      .map((i) => this.parser.mapDecorators(i))
      .map((i) => {
        this.logger.info(`push @${i.name}`);
        return i;
      });
  }

  private generateService(app: Application, path: string, results: string[]): IDocService[] {
    this.logger.debug("check services");
    const declarations = this.generateDeclarations(app, path, results);

    return declarations
      .map((i) => i.children[i.children.length - 1])
      .map((i) => this.parser.mapService(i))
      .map((i) => {
        this.logger.info(`push ${i.name}`);
        return i;
      });
  }

  private generateEnv(app: Application, path: string, results: string[]): IDocEnv[] {
    this.logger.debug("check env");
    const declarations = this.generateDeclarations(app, path, results);

    return declarations.reduce<IDocEnv[]>((env, d) => env
      .concat(d.children[0].children
        .filter((m) => m.decorators && m.decorators[0].name === "env")
        .map((m) => ({
          default: m.defaultValue,
          description: this.parser.getDescription(m),
          name: m.decorators[0].arguments[Object.keys(m.decorators[0].arguments)[0]],
          optional: m.defaultValue !== undefined,
          target: m.parent.name,
          type: this.parser.getType(m.type),
        }))), [])
      .map((i) => {
        i.name = i.name.replace(/"/igm, "");
        this.logger.info(`push ${i.name}`);
        return i;
      });
  }

  private generateDeclarations(app: Application, path: string, results: string[]): DeclarationReflection[] {

    const files = results.map((i) => path + "/" + i.replace(/\.tsx?/mgi, ""));
    const reflection: ProjectReflection = app.convert(files);

    if (!reflection) {
      return [];
    }

    const children = reflection.children || [];
    if (children.length === 0) {
      return children;
    }

    return children.filter((i: any) => files.indexOf(i.originalName.replace(/\.tsx?/mgi, "")) > -1);
  }
}
