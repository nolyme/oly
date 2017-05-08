import { readFileSync, writeFileSync } from "fs";
import { env, inject, Logger } from "oly-core";
import { ObjectMapper } from "oly-mapper";
import { resolve } from "path";
import { Application, ProjectReflection } from "typedoc";
import { DeclarationReflection } from "typedoc/dist/lib/models";
import { DocBuilder } from "./DocBuilder";
import { DocParser } from "./DocParser";
import { IDoc, IDocDecorator, IDocEnv, IDocService, IModuleContent } from "./interfaces";
import { Configuration } from "./models/Configuration";
import { ModuleConfiguration } from "./models/ModuleConfiguration";

export class DocProvider {

  @env("CWD") private cwd: string = process.cwd();
  @env("JSON") private json: boolean = false;
  @env("DIRECTORY_ROOT") private root: string = "packages";
  @env("DIRECTORY_SRC") private src: string = "src";
  @env("DIRECTORY_OUT") private out: string = "docs";

  @inject private logger: Logger;
  @inject private parser: DocParser;
  @inject private builder: DocBuilder;
  @inject private objectMapper: ObjectMapper;

  public async onStart() {
    const configPath = resolve(this.cwd, "docs.json");
    const config = this.objectMapper.parse(Configuration, readFileSync(configPath, "UTF-8"));
    const output = resolve(this.cwd, this.out);
    const modules: IModuleContent[] = [];
    for (const m of config.modules) {
      modules.push(this.create(resolve(this.cwd, this.root, m.name), m));
    }
    const doc: IDoc = {
      home: this.parser.mark(readFileSync(resolve(this.cwd, config.home), "UTF-8")),
      modules,
      name: config.name,
      version: config.version,
    };
    if (this.json) {
      writeFileSync(resolve(output, "doc.json"), JSON.stringify(doc), "UTF-8");
    } else {
      await this.builder.build(output, doc);
    }
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
      dependencies: m.dependencies,
      env: this.generateEnv(app, sources, m.env, m.name === "oly-core"),
      home: this.parser.mark(readFileSync(resolve(project, m.home), "UTF-8")),
      name: m.name,
      services: this.generateService(app, sources, m.services),
    };
  }

  private generateDecorator(app: Application, path: string, results: string[]): IDocDecorator[] {
    const declarations = this.generateDeclarations(app, path, results);
    this.logger.debug(`write decorators (${declarations.length})`);
    return declarations
      .map((i) => i.children[i.children.length - 1])
      .map((i) => i.signatures[0])
      .map((i) => this.parser.mapDecorators(i));
  }

  private generateService(app: Application, path: string, results: string[]): IDocService[] {
    const declarations = this.generateDeclarations(app, path, results);
    this.logger.debug(`write services (${declarations.length})`);
    return declarations
      .map((i) => i.children[i.children.length - 1])
      .map((i) => this.parser.mapService(i));
  }

  private generateEnv(app: Application, path: string, results: string[], isCore = false): IDocEnv[] {
    const declarations = this.generateDeclarations(app, path, results);
    this.logger.debug(`write env (${declarations.length})`);
    const env = isCore
      ? declarations.map((i) => i.children[0])
      : declarations
        .map((i) => i.children[0])
        .map((i) => i.children[0]);
    return env[0].children
      .map((i) => this.parser.mapEnv(i));
  }

  private generateDeclarations(app: Application, path: string, results: string[]): DeclarationReflection[] {

    const files = results.map((i) => path + "/" + i.replace(/\.tsx?/mgi, ""));
    const reflection: ProjectReflection = app.convert(files);

    const children = reflection.children || [];
    if (children.length === 0) {
      return children;
    }

    return children.filter((i: any) => files.indexOf(i.originalName.replace(/\.tsx?/mgi, "")) > -1);
  }
}
