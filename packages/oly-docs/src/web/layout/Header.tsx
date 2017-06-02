import { inject } from "oly-core";
import { action, attach, Go, ITransition, Router } from "oly-react";
import * as React from "react";
import { IDoc, IModuleContent } from "../../cli/interfaces";
import { Search } from "./Search";

@attach
export class Header extends React.Component<{ doc: IDoc }, {}> {

  @inject private router: Router;

  @action
  public handleTabChange(module: string): Promise<ITransition> {
    return this.router.go({to: "moduleIndex", params: {module}});
  }

  public getSelectedId() {
    const path = this.router.current.path;
    if (path.indexOf("/m/") === -1) {
      return "/";
    }
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
      <Go to="moduleIndex" key={m.name} params={{module: m.name}}>{m.name}</Go>
    );
  }

  public render() {
    return (
      <nav className="pt-navbar pt-dark">
        <div className="container">
          <div className="pt-navbar-group pt-align-left">
            <Go to="home">Home</Go>
            {this.props.doc.modules.map((m) => this.renderTab(m))}
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
