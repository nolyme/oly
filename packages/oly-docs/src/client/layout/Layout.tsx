import { inject, state } from "oly";
import { View } from "oly-react";
import * as React from "react";
import { Component } from "react";
import Helmet from "react-helmet";
import { Docs } from "../services/Docs";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export interface ILayoutProps {
}

export interface ILayoutState {
}

export class Layout extends Component<ILayoutProps, ILayoutState> {
  @inject docs: Docs;
  @state("Sidebar.isOpen") sidebarIsOpen: boolean;

  div: any;

  public render() {
    return (
      <div className={"Layout" + (this.sidebarIsOpen ? " sidebar-is-open" : "")}>
        <Helmet>
          <title>Docs</title>
        </Helmet>
        <Navbar/>
        <div className="Layout__content">
          <Sidebar/>
          <div className="Layout__overflow" id="view" ref={(el) => this.div = el}>
            <View onChange={() =>
              this.div ? this.div.scrollTop = 0 : undefined
            }/>
          </div>
        </div>
      </div>
    );
  }
}
