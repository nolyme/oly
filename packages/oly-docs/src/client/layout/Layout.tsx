import { inject } from "oly";
import { Go, View } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { Docs } from "../services/Docs";
import { Search } from "./Search";

export interface ILayoutProps {
}

export interface ILayoutState {
}

export class Layout extends Component<ILayoutProps, ILayoutState> {
  @inject docs: Docs;

  public render() {
    return (
      <div className="main-layout">
        <div className="navbar-brand">
          <Go className="navbar-item" to="/">
            <strong>o<em>l</em>y project</strong>
          </Go>
          {this.docs.modules.map(m =>
            <Go
              to="module"
              params={{module: m.name}}
              key={m.name}
              className="navbar-item is-tab"
            >
              {m.name.replace("oly-", "")}
            </Go>,
          )}
          <div style={{padding: "8px", textAlign: "right", width: "100%"}}>
            <Search/>
            <a
              target="_blank"
              className="button"
              href="https://github.com/nolyme/oly">
              Github
            </a>
          </div>
        </div>
        <View onChange={() => document.body.scrollTop = 0}/>
        <br/>
        <br/>
        <br/>
        <footer className="footer">
          <div className="container">
            <div className="content has-text-centered">
              <p>
                Built with
                {" "}
                <a href="https://facebook.github.io/react/" target="_blank">React</a>
                {" & "}
                <a href="http://bulma.io/" target="_blank">Bulma</a>.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}
