import { Tab2, Tabs2 } from "@blueprintjs/core";
import { inject, on, state } from "oly-core";
import { action, attach, ITransition, olyReactRouterEvents, Router, styles } from "oly-react";
import * as React from "react";
import { IDocs, IModuleContent } from "../../shared/interfaces";
import { Search } from "./Search";

@attach
@styles(() => require("./Header.scss"))
export class Header extends React.Component<{}, {}> {

  @inject private router: Router;

  @state("DOCS") private docs: IDocs;

  @action
  public handleTabChange(module: string): Promise<ITransition> {
    return this.router.go({to: module});
  }

  @on(olyReactRouterEvents.TRANSITION_END)
  public onTransitionEnd() {
    this.forceUpdate();
  }

  public getSelectedId() {
    const path = this.router.current.path;
    if (path.indexOf("/m/") === -1) {
      return this.router.href("home");
    }
    for (const m of this.docs.modules) {
      if (this.router.isActive({to: "moduleById", params: {module: m.name}})) {
        return this.router.href({to: "moduleById", params: {module: m.name}});
      }
    }
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
        id={this.router.href({to: "moduleById", params: {module: m.name}}) || ""}
        key={m.name}
        title={this.renderTabTitle(m)}
      />
    );
  }

  public render() {
    return (
      <nav className="header pt-navbar">
        <div className="container">
          <div className="pt-navbar-group pt-align-left">
            <Tabs2
              onChange={this.handleTabChange}
              id="TabsHeader"
              selectedTabId={this.getSelectedId()}
              defaultSelectedTabId={this.getSelectedId()}
            >
              <Tab2
                id={this.router.href("home") || ""}
                title={
                  <div>
                    <div>o<span style={{fontStyle: "italic"}}>l</span>y</div>
                    <small>{this.docs.version}</small>
                  </div>
                }
                className="title"
              />
              {this.docs.modules.map((m) => this.renderTab(m))}
            </Tabs2>
          </div>
          <div className="pt-navbar-group pt-align-right">
            <Search docs={this.docs}/>
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
