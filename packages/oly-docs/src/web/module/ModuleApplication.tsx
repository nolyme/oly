import { state } from "oly-core";
import { layout, page, param } from "oly-react";
import * as React from "react";
import { IDocs, IModuleContent } from "../../cli/interfaces";
import { NotFound } from "../layout/NotFound";
import { ApiConfiguration } from "./ApiConfiguration";
import { ApiDecorator } from "./ApiDecorator";
import { ApiService } from "./ApiService";
import { ApiServiceMethod } from "./ApiServiceMethod";
import { Module } from "./Module";
import { ModuleIndex } from "./ModuleIndex";

export class ModuleApplication {

  @state("DOCS") docs: IDocs;

  module: IModuleContent;

  @layout("/m/:module")
  public moduleById(@param("module") moduleName: string) {
    this.module = this.docs.modules.filter((m) => m.name === moduleName)[0];
    if (!this.module) {
      return NotFound;
    }
    return <Module module={this.module}/>;
  }

  @page("/")
  public index() {
    return <ModuleIndex module={this.module}/>;
  }

  @page("/configuration")
  public configuration() {
    return <ApiConfiguration module={this.module}/>;
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
