import { state } from "oly-core";
import { page, path } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../src/interfaces";
import { NotFound } from "../layout/NotFound";
import { ApiDecorator } from "./ApiDecorator";
import { ApiService } from "./ApiService";
import { ModuleIndex } from "./ModuleIndex";

export class AppModule {

  @state("module") private module: IModuleContent;

  @page("/")
  public index() {
    return ModuleIndex;
  }

  @page("/@/:decorator")
  public decorator(@path("decorator") decoratorName: string) {
    const decorator = this.module.decorators.filter((s) => s.name === decoratorName)[0];
    if (!decorator) {
      return NotFound;
    }
    return <ApiDecorator module={this.module} decorator={decorator}/>;
  }

  @page("/s/:service")
  public service(@path("service") serviceName: string) {
    const service = this.module.services.filter((s) => s.name === serviceName)[0];
    if (!service) {
      return NotFound;
    }
    return <ApiService module={this.module} service={service}/>;
  }
}
