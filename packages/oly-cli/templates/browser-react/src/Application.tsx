import { page } from "oly-react";
import * as React from "react";
import { Home } from "./components/Home";

export class Application {

  @page("/")
  public home() {
    return <Home/>;
  }
}
