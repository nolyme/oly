import { state } from "oly-core";
import { action, attach } from "oly-react";
import * as React from "react";

@attach
export class Header extends React.Component<{}, {}> {

  @state("THEME") private theme: string = "pt-dark";

  @action
  public onChangeTheme() {
    if (this.theme === "pt-light") {
      this.theme = "pt-dark";
    } else {
      this.theme = "pt-light";
    }
  }

  public render() {
    return (
      <nav className="pt-navbar">
        <div className="container">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading">
              <div className="pt-navbar-heading">
                <span>oly</span>
                {"  "}
                <small>v0.9.0</small>
              </div>
            </div>
          </div>
          <div className="pt-navbar-group pt-align-right">
            <div className="pt-input-group" style={{marginRight: "20px"}}>
              <span className="pt-icon pt-icon-search"/>
              <input
                type="search"
                placeholder="Search..."
                value=""
                style={{width: "300px"}}
                className="pt-input"
              />
            </div>
            <a
              className="pt-button pt-minimal pt-icon-git-repo"
              href="https://github.com/nolyme/oly"
            >
              Github
            </a>
            <span className="pt-navbar-divider"/>
            <button onClick={this.onChangeTheme} className="pt-button pt-minimal pt-icon-cog"/>
          </div>
        </div>
      </nav>
    );
  }
}
