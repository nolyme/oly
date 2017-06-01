import { state } from "oly-core";
import { page, param } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../cli/interfaces";
import { NotFound } from "../layout/NotFound";
import { ApiDecorator } from "./ApiDecorator";
import { ApiService } from "./ApiService";
import { ApiServiceMethod } from "./ApiServiceMethod";
import { ModuleIndex } from "./ModuleIndex";

export class AppModule {

  @state("App.module")
  private module: IModuleContent;

  @page("/")
  public moduleIndex() {
    return <ModuleIndex module={this.module}/>;
  }

  @page("/@/:decorator")
  public decorator(@param("decorator") decoratorName: string) {
    const decorator = this.module.decorators.filter((s) => s.name === decoratorName)[0];
    if (!decorator) {
      return NotFound;
    }
    return <ApiDecorator module={this.module} decorator={decorator}/>;
  }

  @page("/s/:service")
  public service(@param("service") serviceName: string) {
    const service = this.module.services.filter((s) => s.name === serviceName)[0];
    if (!service) {
      return NotFound;
    }
    return <ApiService module={this.module} service={service}/>;
  }

  @page("/s/:service/:method")
  public serviceMethod(@param("service") serviceName: string,
                       @param("method") methodName: string) {
    const service = this.module.services.filter((s) => s.name === serviceName)[0];
    if (!service) {
      return NotFound;
    }
    const method = service.methods.filter((m) => m.name === methodName)[0];
    if (!method) {
      return NotFound;
    }
    return <ApiServiceMethod service={service} method={method}/>;
  }
}
