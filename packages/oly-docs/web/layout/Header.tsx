import { Tab2, Tabs2 } from "@blueprintjs/core";
import { inject } from "oly-core";
import { action, attach, Router } from "oly-react";
import * as React from "react";
import { IDoc, IModuleContent } from "../../src/interfaces";
import { Search } from "./Search";

@attach
export class Header extends React.Component<{ doc: IDoc }, {}> {

  @inject private router: Router;

  @action
  public handleTabChange(pathname: string) {
    this.router.navigate(pathname);
  }

  public getSelectedId() {
    const path = this.router.current.pathname;
    if (path.indexOf("/m/") === -1) {
      return "/";
    }
    console.log(path.replace(/(\/m\/[a-z-]*)\/.*/igm, "$1"));
    return path.replace(/(\/m\/[a-z-]*)\/.*/igm, "$1");
  }

  public renderTabTitle(m: IModuleContent) {
    return (
      <div>
        <span className={"pt-icon-standard pt-icon-" + (m.icon || "code-block")}/>
        <div style={{marginTop: "-10px"}}>{m.name.replace("oly-", "")}</div>
      </div>
    );
  }

  public renderTab(m: IModuleContent) {
    return (
      <Tab2
        className="with-icon"
        id={`/m/${m.name}`}
        key={m.name}
        title={this.renderTabTitle(m)}
      />
    );
  }

  public render() {
    return (
      <nav className="pt-navbar pt-dark">
        <div className="container">
          <div className="pt-navbar-group pt-align-left">
            <Tabs2
              onChange={this.handleTabChange}
              id="TabsHeader"
              selectedTabId={this.getSelectedId()}
              defaultSelectedTabId={this.getSelectedId()}
            >
              <Tab2 id="/" title={<div>o<span style={{fontStyle: "italic"}}>l</span>y</div>} className="title"/>
              {this.props.doc.modules.map((m) => this.renderTab(m))}
            </Tabs2>
          </div>
          <div className="pt-navbar-group pt-align-right">
            <Search doc={this.props.doc}/>
            <a
              className="pt-button pt-minimal pt-icon-git-repo"
              href="https://github.com/nolyme/oly"
            >
              Github
            </a>
          </div>
        </div>
      </nav>
    );
  }
}
