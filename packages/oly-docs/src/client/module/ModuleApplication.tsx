import { state } from "oly";
import { layout, page, param } from "oly-react";
import * as React from "react";
import { IDocs, IModuleContent } from "../../shared/interfaces";
import { NotFound } from "../layout/NotFound";
import { ApiComponent } from "./ApiComponent";
import { ApiConfiguration } from "./ApiConfiguration";
import { ApiDecorator } from "./ApiDecorator";
import { ApiException } from "./ApiException";
import { ApiManual } from "./ApiManual";
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

  @page("/m/:manual")
  public manual(@param("manual") manualName: string) {
    const manual = this.module.manuals.filter((m) => m.name === manualName)[0];
    if (!manual) {
      return NotFound;
    }
    return <ApiManual module={this.module} manual={manual}/>;
  }

  @page("/c/:component")
  public component(@param("component") componentName: string) {
    const component = this.module.components.filter((c) => c.name === componentName)[0];
    if (!component) {
      return NotFound;
    }
    return <ApiComponent module={this.module} component={component}/>;
  }

  @page("/@/:decorator")
  public decorator(@param("decorator") decoratorName: string) {
    const decorator = this.module.decorators.filter((s) => s.name === decoratorName)[0];
    if (!decorator) {
      return NotFound;
    }
    return <ApiDecorator module={this.module} decorator={decorator}/>;
  }

  @page("/x/:exception")
  public exception(@param("exception") exceptionName: string) {
    const exception = this.module.exceptions.filter((s) => s.name === exceptionName)[0];
    if (!exception) {
      return NotFound;
    }
    return <ApiException module={this.module} exception={exception}/>;
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
