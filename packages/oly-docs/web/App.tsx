import { env, state } from "oly-core";
import { page, page404, pageLayout, path } from "oly-react";
import * as React from "react";
import { IDoc, IModuleContent } from "../src/interfaces";
import { AppModule } from "./module/AppModule";
import { Module } from "./module/Module";
import { Home } from "./layout/Home";
import { Layout } from "./layout/Layout";
import { NotFound } from "./layout/NotFound";

export class App {

  @state("module") private module: IModuleContent;

  @env("DOC")
  private doc: IDoc;

  @pageLayout
  public layout() {
    return Layout;
  }

  @page("/")
  public index() {
    return Home;
  }

  @page("/m/:module", {
    children: [AppModule],
  })
  public modulePages(@path("module") moduleName: string) {
    this.module = this.doc.modules.filter((m) => m.name === moduleName)[0];
    if (!this.module) {
      return NotFound;
    }
    return (props: object) => (
      <Module {...props} module={this.module}/>
    );
  }

  @page404
  public notFound() {
    return NotFound;
  }
}
