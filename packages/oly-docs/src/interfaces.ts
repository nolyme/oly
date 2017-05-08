export interface IDocMethod {
  name: string;
  description: string;
  parameters: IDocParameter[];
  returnType: string;
  returnDescription: string;
}

export interface IDocService {
  name: string;
  description: string;
  methods: IDocMethod[];
}

export interface IDocParameter {
  name: string;
  description: string;
  type: string;
  optional: boolean;
  default?: string;
}

export interface IDocDecorator {
  name: string;
  description: string;
  parameters: IDocParameter[];
}

export interface IDocEnv {
  name: string;
  description: string;
  default?: string;
  optional: boolean;
  type: string;
}

export interface IModuleContent {
  name: string;
  home: string;
  dependencies: string[];
  services: IDocService[];
  env: IDocEnv[];
  decorators: IDocDecorator[];
}

export interface IDoc {
  name: string;
  home: string;
  version: string;
  modules: IModuleContent[];
}
