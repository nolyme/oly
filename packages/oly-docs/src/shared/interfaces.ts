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
}

export interface IDocComponent {
  name: string;
  description: string;
  props: IDocParameter[];
  install: string;
}

export interface IDocDecorator {
  name: string;
  description: string;
  parameters: IDocParameter[];
  install: string;
}

export interface IDocException {
  name: string;
  description: string;
  install: string;
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
  icon?: string;
  home: string;
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
