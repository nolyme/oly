import { inject } from "oly";
import { layout, page } from "oly-react";
import * as React from "react";
import { ModulePages } from "../+module/ModulePages";
import { Docs } from "../services/Docs";
import { Home } from "./Home";
import { Layout } from "./Layout";

export class MainPages {
  @inject docs: Docs;

  @layout({
    children: [
      ModulePages,
    ],
  })
  root() {
    return Layout;
  }

  @page("/") home() {
    return Home;
  }
}
