import { env, state } from "oly-core";
import { layout, page, page404, param } from "oly-react";
import * as React from "react";
import { IDoc, IModuleContent } from "../cli/interfaces";
import { Home } from "./layout/Home";
import { Layout } from "./layout/Layout";
import { NotFound } from "./layout/NotFound";
import { AppModule } from "./module/AppModule";
import { Module } from "./module/Module";

export class App {

  @env("DOCS")
  private doc: IDoc;

  @state
  private module: IModuleContent;

  @layout
  public layout() {
    return <Layout doc={this.doc}/>;
  }

  @page("/")
  public home() {
    return <Home doc={this.doc}/>;
  }

  @page({
    children: [AppModule],
    path: "/m/:module",
  })
  public modulePages(@param("module") module: string) {
    this.module = this.doc.modules.filter((m) => m.name === module)[0];
    if (!this.module) {
      return NotFound;
    }
    return <Module module={this.module}/>;
  }

  @page404
  public notFound() {
    return NotFound;
  }
}
