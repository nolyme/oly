import * as marked from "marked";
import {
  DeclarationReflection,
  ParameterReflection,
  Reflection,
  SignatureReflection,
  Type,
} from "typedoc/dist/lib/models";
import { IDocDecorator, IDocEnv, IDocMethod, IDocParameter, IDocService } from "./interfaces";

marked.setOptions({
  highlight: (code) => require("highlight.js").highlightAuto(code).value,
});

export class DocParser {

  public mapDecorators(decorator: SignatureReflection): IDocDecorator {
    return {
      description: this.getDescription(decorator),
      name: decorator.name,
      parameters: decorator.parameters
        .map((param) => this.mapParameter(param))
        .filter((param) => param.name !== "propertyKey")
        .map((param) => {
          param.type = param.type
            .replace(" | any", "")
            .replace("any | ", "");
          return param;
        }),
    };
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

  public mapService(service: DeclarationReflection): IDocService {
    return {
      description: this.getDescription(service),
      methods: this.getPublicMethods(service),
      name: service.name,
    };
  }

  public mapMethod(data: DeclarationReflection): IDocMethod {
    return {
      description: this.getDescription(data.signatures[0]),
      name: data.name,
      parameters: this.getParameters(data),
      returnDescription: this.getReturnsTypeDescription(data.signatures[0]),
      returnType: this.getType(data.signatures[0].type),
    };
  }

  public mapEnv(env: DeclarationReflection): IDocEnv {
    return {
      default: this.getDefaultValue(env),
      description: this.getDescription(env),
      name: env.name,
      optional: this.getIsOptional(env),
      type: this.getType(env.type).replace("undefined | ", ""),
    };
  }

  public getPublicMethods(declaration: DeclarationReflection): IDocMethod[] {

    if (!Array.isArray(declaration.children)) {
      return [];
    }

    return declaration.children
      .filter((c) => c.kindString === "Method" && c.flags.isPublic)
      .map((m) => this.mapMethod(m));
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
      return this.mark(tag.text);
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

  public mark(text: string): string {

    return marked(text).replace(/\n$/mgi, "").trim();
  }
}
