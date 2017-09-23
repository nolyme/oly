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
  install: string;
  path: string;
}

export interface IDocParameter {
  name: string;
  description: string;
  type: string;
  optional: boolean;
  default?: string;
}

export interface IDocManual {
  content: string;
  name: string;
  path: string;
}

export interface IDocComponent {
  name: string;
  description: string;
  props: IDocParameter[];
  install: string;
  path: string;
}

export interface IDocDecorator {
  name: string;
  description: string;
  parameters: IDocParameter[];
  install: string;
  path: string;
}

export interface IDocException {
  name: string;
  description: string;
  install: string;
  path: string;
}

export interface IDocEnv {
  name: string;
  description: string;
  default?: string;
  optional: boolean;
  target?: string;
  type: string;
}

export interface IInterface {
  name: string;
  parents: string[];
  properties: {
    [key: string]: string;
  };
}

export interface IModuleContent {
  name: string;
  type: string;
  icon?: string;
  home: string;
  version: string;
  interfaces: IInterface[];
  services: IDocService[];
  manuals: IDocManual[];
  components: IDocComponent[];
  exceptions: IDocException[];
  env: IDocEnv[];
  decorators: IDocDecorator[];
}

export interface IDocs {
  name: string;
  home: string;
  version: string;
  modules: IModuleContent[];
}
