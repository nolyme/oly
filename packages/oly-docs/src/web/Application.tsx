import { layout, page } from "oly-react";
import * as React from "react";
import { Home } from "./layout/Home";
import { Layout } from "./layout/Layout";
import { NotFound } from "./layout/NotFound";
import { ModuleApplication } from "./module/ModuleApplication";

export class Application {

  @layout({
    children: [ModuleApplication],
  })
  root() {
    return <Layout/>;
  }

  @page("/")
  public home() {
    return <Home/>;
  }

  @page("/*")
  public notFound() {
    return NotFound;
  }
}
