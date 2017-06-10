import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { env, Global, inject, Logger } from "oly-core";
import { JsonService } from "oly-json";
import { basename, resolve } from "path";
import { Application, ProjectReflection } from "typedoc";
import { DeclarationReflection } from "typedoc/dist/lib/models";
import { DocBuilder } from "./DocBuilder";
import { DocParser } from "./DocParser";
import { IDocComponent, IDocDecorator, IDocEnv, IDocManual, IDocs, IDocService, IModuleContent } from "./interfaces";
import { Configuration } from "./models/Configuration";
import { ModuleConfiguration } from "./models/ModuleConfiguration";

export class DocProvider {

  // where to scan docs
  @env("CWD") private cwd: string = process.cwd();

  // run webpack ?
  @env("HTML") private html: boolean = true;

  // internal conf, shouldn't be updated
  @env("DIRECTORY_ROOT") private root: string = "packages";
  @env("DIRECTORY_SRC") private src: string = "src";
  @env("DIRECTORY_OUT") private out: string = "docs";

  @inject private logger: Logger;
  @inject private parser: DocParser;
  @inject private builder: DocBuilder;
  @inject private jsonService: JsonService;

  public async onStart() {
    const webpackArgv = process.argv.slice(2).join(" ");
    const webpackContext = resolve(__dirname + "/../../");
    const webpackConfig = webpackContext + "/webpack.config.ts";
    const webpackPath = resolve(__dirname + "/../../node_modules/.bin/webpack");
    const configPath = resolve(this.cwd, "docs.json");
    const config = this.jsonService.build(Configuration, readFileSync(configPath, "UTF-8"));
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
    const docsName = "docs." + Global.shortid() + ".js";
    const outputDocs = resolve(output, docsName);
    writeFileSync(outputDocs, "window.__DOCS__=" + JSON.stringify(doc) + ";");

    // update index.html
    if (this.html) {
      const outputHtml = resolve(output, "index.html");
      this.logger.info(`update ${outputHtml}`);
      const html = readFileSync(outputHtml, "UTF-8");
      writeFileSync(outputHtml, html.replace(
        /<\/head>/igm,
        `<script type="text/javascript" src="${docsName}"></script></head>`),
        "UTF-8");
    }
    this.logger.info(`everything is great, have a nice day`);
  }

  private check(filepath: string): void {
    this.logger.trace(`read ${filepath}`);
    if (!existsSync(filepath)) {
      throw new Error(`Missing ${filepath}`);
    }
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
      decorators: this.generateDecorator(app, sources, m.decorators),
      interfaces: [],
      components: this.generateComponents(app, sources, m.components),
      manuals: this.generateManuals(app, project, m.manuals),
      env: this.generateEnv(app, sources, m.services),
      home: this.parser.mark(readFileSync(resolve(project, "README.md"), "UTF-8")),
      icon: m.icon,
      name: m.name,
      services: this.generateService(app, sources, m.services),
    };
  }

  private generateManuals(app: Application, path: string, results: string[] = []): IDocManual[] {
    this.logger.debug("check manuals");
    results.map((r) => this.check(resolve(path, r)));
    return results.map((filepath) => {
      return {
        name: basename(filepath, ".md"),
        content: this.parser.mark(readFileSync(resolve(path, filepath), "UTF-8")),
      };
    });
  }

  private generateComponents(app: Application, path: string, results: string[] = []): IDocComponent[] {
    this.logger.debug("check components");
    results.map((r) => this.check(resolve(path, r)));

    const components = this.generateDeclarations(app, path, results);
    return components.map((c) => {
      const clazz = c.children.find(
        (p) => p.kindString === "Class");
      const props = c.children.find(
        (p) => p.kindString === "Interface" && p.name.includes("Props"));
      if (!clazz) {
        throw new Error("Invalid " + props);
      }
      this.logger.info(`push <${clazz.name}/>`);
      return {
        name: clazz.name,
        description: this.parser.getDescription(clazz),
        props: props
          ? props.children.filter((p) => !p.inheritedFrom).map((p) => {
            return {
              name: p.name,
              description: this.parser.getDescription(p),
              type: this.parser.getType(p.type),
              optional: p.flags.isOptional || false,
              default: "N/A",
            };
          })
          : []
        ,
      };
    });
  }

  private generateDecorator(app: Application, path: string, results: string[] = []): IDocDecorator[] {
    this.logger.debug("check decorators");
    results.map((r) => this.check(resolve(path, r)));
    const declarations = this.generateDeclarations(app, path, results);

    return declarations
      .map((i) => i.children[i.children.length - 1])
      .map((i) => this.parser.mapDecorators(i))
      .map((i) => {
        this.logger.info(`push @${i.name}`);
        return i;
      });
  }

  private generateService(app: Application, path: string, results: string[] = []): IDocService[] {
    this.logger.debug("check services");
    results.map((r) => this.check(resolve(path, r)));
    const declarations = this.generateDeclarations(app, path, results);

    return declarations
      .map((i) => i.children[i.children.length - 1])
      .map((i) => this.parser.mapService(i))
      .map((i) => {
        this.logger.info(`push ${i.name}`);
        return i;
      });
  }

  private generateEnv(app: Application, path: string, results: string[] = []): IDocEnv[] {
    this.logger.debug("check env");
    results.map((r) => this.check(resolve(path, r)));
    const declarations = this.generateDeclarations(app, path, results);

    const envResults: IDocEnv[] = declarations.reduce<IDocEnv[]>((env, d) => env
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

    const final: IDocEnv[] = [];
    for (const r of envResults) {
      if (!final.find((f) => f.name === r.name)) {
        final.push(r);
      } else {
        this.logger.info(`remove duplicate ${r.name}`);
      }
    }

    return final;
  }

  private generateDeclarations(app: Application, path: string, results: string[] = []): DeclarationReflection[] {

    const files = results.map((i) => path + "/" + i.replace(/\.tsx?/mgi, ""));
    const reflection: ProjectReflection = app.convert(files);

    if (!reflection) {
      return [];
    }

    const children = reflection.children || [];
    if (children.length === 0) {
      return children;
    }

    return children.filter((i: any) =>
      files.indexOf(i.originalName.replace(/\.tsx?/mgi, "")) > -1);
  }
}
