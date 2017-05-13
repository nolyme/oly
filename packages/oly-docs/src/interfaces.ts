export interface IDocMethod {
  name: string;
  description: string;
  parameters: IDocParameter[];
  returnType: string;
  returnDescription: string;
  static: boolean;
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
  target?: string;
  type: string;
}

export interface IModuleContent {
  name: string;
  icon?: string;
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
