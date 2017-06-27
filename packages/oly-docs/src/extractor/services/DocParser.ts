import { existsSync, readFileSync } from "fs";
import * as marked from "marked";
import { inject, Logger } from "oly-core";
import { basename, resolve } from "path";
import * as Prism from "prismjs";
import "prismjs/components/prism-bash.js";
import { Application, ProjectReflection } from "typedoc";
import {
  DeclarationReflection,
  ParameterReflection,
  Reflection,
  ReflectionKind,
  SignatureReflection,
  Type,
} from "typedoc/dist/lib/models";
import {
  IDocComponent,
  IDocDecorator,
  IDocEnv,
  IDocException,
  IDocManual,
  IDocMethod,
  IDocParameter,
  IDocService,
} from "../../shared/interfaces";
import { ModuleConfiguration } from "../models/ModuleConfiguration";
import "./prism/prism-tsx";

const renderer = new marked.Renderer();

renderer.table = (header, body) => {
  return "<table class='pt-table pt-striped'>\n"
    + "<thead>\n"
    + header
    + "</thead>\n"
    + "<tbody>\n"
    + body
    + "</tbody>\n"
    + "</table>\n";
};

renderer.code = (code, language) => {
  if (!language) {
    return `<pre><code>${code}</code></pre>`;
  }
  const highlighted = Prism.highlight(code.replace(/&shy;/gim, ""), Prism.languages[language]);
  return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`;
};

export class DocParser {

  @inject logger: Logger;

  public check(filepath: string): void {
    this.logger.trace(`read ${filepath}`);
    if (!existsSync(filepath)) {
      throw new Error(`Missing ${filepath}`);
    }
  }

  public generateManuals(app: Application, path: string, results: string[] = []): IDocManual[] {
    this.logger.debug("check manuals");
    results.map((r) => this.check(resolve(path, r)));
    return results.map((filepath) => {
      return {
        path: filepath,
        name: basename(filepath, ".md"),
        content: this.mark(readFileSync(resolve(path, filepath), "UTF-8")),
      };
    });
  }

  public generateComponents(app: Application, path: string, m: ModuleConfiguration): IDocComponent[] {
    this.logger.debug("check components");
    const results = m.components || [];
    results.map((r) => this.check(resolve(path, r)));

    const components = this.generateDeclarations(app, path, results);
    return components.map((file) => {
      const clazz = file.children.filter((p) => p.kindString === "Class")[0];
      const props = file.children.filter((p) => p.kindString === "Interface" && p.name.indexOf("Props") > -1)[0];
      if (!clazz) {
        throw new Error("Invalid " + props);
      }
      this.logger.info(`push <${clazz.name}/>`);
      return {
        path: file.originalName.replace(path, ""),
        name: clazz.name,
        description: this.getDescription(clazz),
        install: this.markInstall(clazz.name, m.name),
        props: props
          ? props.children.filter((p) => !p.inheritedFrom).map((p) => {
            return {
              name: p.name,
              description: this.getDescription(p),
              type: this.getType(p.type),
              optional: p.flags.isOptional || false,
              default: "N/A",
            };
          })
          : []
        ,
      };
    });
  }

  public generateDecorator(app: Application, path: string, m: ModuleConfiguration): IDocDecorator[] {
    this.logger.debug("check decorators");
    const results = m.decorators || [];
    results.map((r) => this.check(resolve(path, r)));
    const declarations = this.generateDeclarations(app, path, results);

    return declarations.map((file) => {
      const decorator = file.children[file.children.length - 1];
      this.logger.info(`push @${decorator.name}`);
      return {
        path: file.originalName.replace(path, ""),
        description: this.getDescription(decorator),
        name: decorator.name,
        install: this.markInstall(decorator.name, m.name),
        parameters: [],
      };
    });
  }

  public generateService(app: Application, path: string, m: ModuleConfiguration): IDocService[] {
    this.logger.debug("check services");
    const results = m.services || [];
    results.map((r) => this.check(resolve(path, r)));
    const declarations = this.generateDeclarations(app, path, results);

    return declarations.map((file) => {
      const service = file.children[file.children.length - 1];
      this.logger.info(`push ${service.name}`);
      return {
        path: file.originalName.replace(path, ""),
        description: this.getDescription(service),
        methods: this.getPublicMethods(service),
        install: this.markInstall(service.name, m.name),
        name: service.name,
      };
    });
  }

  public generateException(app: Application, path: string, m: ModuleConfiguration): IDocException[] {
    this.logger.debug("check exceptions");
    const results = m.exceptions || [];
    results.map((r) => this.check(resolve(path, r)));
    const declarations = this.generateDeclarations(app, path, results);
    return declarations.map((file) => {
      const exception = file.children.filter((c) => c.kind = ReflectionKind.Class)[0];
      this.logger.info(`push ${exception.name}`);
      return {
        path: file.originalName.replace(path, ""),
        description: this.getDescription(exception),
        install: this.markInstall(exception.name, m.name),
        name: exception.name,
      };
    });
  }

  public generateEnv(app: Application, path: string, results: string[] = []): IDocEnv[] {
    this.logger.debug("check env");
    results.map((r) => this.check(resolve(path, r)));
    const declarations = this.generateDeclarations(app, path, results);

    const envResults: IDocEnv[] = declarations.reduce<IDocEnv[]>((env, d) => env
      .concat(d.children[0].children
        .filter((m) => m.decorators && m.decorators[0].name === "env")
        .map((m) => ({
          default: m.defaultValue,
          description: this.getDescription(m),
          name: m.decorators[0].arguments[Object.keys(m.decorators[0].arguments)[0]],
          optional: m.defaultValue !== undefined,
          target: m.parent.name,
          type: this.getType(m.type),
        }))), [])
      .map((i) => {
        i.name = i.name.replace(/"/igm, "");
        this.logger.info(`push ${i.name}`);
        return i;
      });

    const final: IDocEnv[] = [];
    for (const r of envResults) {
      if (!final.filter((f) => f.name === r.name)[0]) {
        final.push(r);
      } else {
        this.logger.info(`remove duplicate ${r.name}`);
      }
    }

    return final;
  }

  public generateDeclarations(app: Application, path: string, results: string[] = []): DeclarationReflection[] {

    const files = results.map((i) => path + "/" + i.replace(/\.tsx?/mgi, ""));
    const reflection: ProjectReflection = app.convert(files);

    if (!reflection) {
      return [];
    }

    const children = reflection.children || [];
    if (children.length === 0) {
      return children;
    }

    return children
      .filter((i: any) => files.indexOf(i.originalName.replace(/\.tsx?/mgi, "")) > -1);
  }

  public mapParameter(parameter: ParameterReflection): IDocParameter {
    return {
      default: this.getParameterDefaultValue(parameter),
      description: this.getDescription(parameter),
      name: parameter.name,
      optional: this.getIsOptional(parameter),
      type: this.getType(parameter.type),
    };
  }

  public mapMethod(data: DeclarationReflection): IDocMethod {
    return {
      description: this.getDescription(data.signatures[0]),
      name: data.name,
      parameters: this.getParameters(data),
      returnDescription: this.getReturnsTypeDescription(data.signatures[0]),
      returnType: this.getType(data.signatures[0].type),
      static: !!data.flags.isStatic,
    };
  }

  public mapEnv(env: DeclarationReflection): IDocEnv {
    return {
      default: this.getDefaultValue(env),
      description: this.getDescription(env),
      name: env.name,
      optional: this.getIsOptional(env),
      target: this.getTag(env, "target"),
      type: this.getType(env.type).replace("undefined | ", ""),
    };
  }

  public getPublicMethods(declaration: DeclarationReflection): IDocMethod[] {

    if (!Array.isArray(declaration.children)) {
      return [];
    }

    return declaration.children
      .filter((c) =>
        c.kindString === "Method" &&
        c.flags.isPublic &&
        !this.isInternal(c),
      )
      .map((m) => this.mapMethod(m));
  }

  public isInternal(declaration: DeclarationReflection | Reflection): boolean {
    if (declaration instanceof DeclarationReflection && declaration.signatures[0]) {
      return this.isInternal(declaration.signatures[0]);
    }
    if (!declaration.comment) {
      return false;
    }
    return declaration.comment.hasTag("internal");
  }

  public getParameters(data: DeclarationReflection): IDocParameter[] {

    if (!data.signatures[0] || !data.signatures[0].parameters) {
      return [];
    }

    return data.signatures[0].parameters.map((p: any) => this.mapParameter(p));
  }

  public getIsOptional(declaration: Reflection): boolean {
    return !!declaration.flags.isOptional;
  }

  public getParameterDefaultValue(parameter: ParameterReflection): string | undefined {
    if (!parameter.defaultValue) {
      return;
    }
    return this.mark(parameter.defaultValue);
  }

  public getReturnsTypeDescription(signature: SignatureReflection): string {

    if (!signature.comment || !signature.comment.returns) {
      return "any";
    }

    return this.mark(signature.comment.returns);
  }

  public getDefaultValue(declaration: DeclarationReflection): string | undefined {

    if (!declaration.comment || !declaration.comment.tags) {
      return undefined;
    }

    const tag = declaration.comment.tags.filter((t) => t.tagName === "default")[0];
    if (tag) {
      return this.sanitize(tag.text);
    }

    return undefined;
  }

  public getTag(declaration: DeclarationReflection, tagName: string): string | undefined {

    if (!declaration.comment || !declaration.comment.tags) {
      return undefined;
    }

    const tag = declaration.comment.tags.filter((t) => t.tagName === tagName)[0];
    if (tag) {
      return this.sanitize(tag.text);
    }

    return undefined;
  }

  public getDescription(data: Reflection): string {

    if (!data.comment) {
      return "";
    }

    if (!data.comment.shortText) {
      return this.mark(data.comment.text);
    }

    return this.mark(data.comment.shortText + (!!data.comment.text ? `\n${data.comment.text}` : ""));
  }

  public getType(type: Type): string {
    return type.toString();
  }

  public sanitize(text: string): string {
    return text.trim();
  }

  public markInstall(service: string, module: string): string {
    return this.mark(`
\`\`\`ts
import { ${service} } from "${module}";
\`\`\`
    `.trim());
  }

  public mark(text: string): string {
    return this.sanitize(marked(text, {
      tables: true,
      renderer,
    }));
  }
}
