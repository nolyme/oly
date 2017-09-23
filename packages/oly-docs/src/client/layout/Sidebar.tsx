import { inject, on, state } from "oly";
import { Go, olyReactRouterEvents, Router } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IModuleContent } from "../../shared/interfaces";
import { Docs } from "../services/Docs";

export interface ISidebarProps {
}

export interface ISidebarState {
  show: string;
}

export class Sidebar extends Component<ISidebarProps, ISidebarState> {
  @state isOpen: boolean;
  @inject docs: Docs;
  @inject router: Router;

  div: any;

  componentWillMount() {

    const active = this.docs.modules.find((m) =>
      this.router.isActive({to: "module", params: {module: m.name}}));

    this.state = {
      show: active ? active.name : "",
    };
  }

  @on(olyReactRouterEvents.TRANSITION_END)
  onTransitionEnd() {

    const active = this.docs.modules.find((m) =>
      this.router.isActive({to: "module", params: {module: m.name}}));

    if (window.innerWidth < 800 && this.isOpen) {
      this.isOpen = false;
    } else {
      this.setState({
        show: active ? active.name : "",
      }, () => {
        if (this.div) {
          this.div.scrollTop = 500;
        }
      });
    }
  }

  render() {
    return (
      <div className="Sidebar">
        <div ref={(el) => this.div = el} className={"Sidebar__content" + (this.isOpen ? " is-open" : "")}>
          <nav className="panel">
            {this.docs.modules.map((m) =>
              [
                <a
                  key={m.name}
                  onClick={() => this.setState({show: this.state.show === m.name ? "" : m.name})}
                  className={"panel-block" + (this.router.isActive({
                    to: "module",
                    params: {module: m.name},
                  }) ? " is-active" : "")}
                >
                <span className="panel-icon">
                  <i className={this.getIcon(m)}/>
                </span>
                  {m.name}
                  <small>({m.version})</small>
                </a>,
                <div>
                  {this.state.show === m.name && this.renderModuleSidebar(m)}
                </div>,
              ],
            )}
          </nav>
        </div>
        <div onClick={() => this.isOpen = false} className={"Sidebar__backdrop" + (this.isOpen ? " is-open" : "")}/>
      </div>
    );
  }

  renderModuleSidebar(module: IModuleContent) {
    return <div className="menu" style={{padding: "20px", paddingTop: "5px"}}>

      <ul className="menu-list">
        <li>
          <Go
            to="module.index"
            params={{module: module.name}}
            strict={true}>
            Readme
          </Go>
        </li>
        {!!module.env.length && <li>
          <Go to="configuration" params={{module: module.name}}>Configuration</Go>
        </li>}
        {module.manuals.map((e) =>
          <li key={e.name}>
            <Go to="manual" params={{module: module.name, manual: e.name}}>{e.name}</Go>
          </li>,
        )}
      </ul>

      {!!module.exceptions.length && <p className="menu-label">
        Exceptions
      </p>}
      {!!module.exceptions.length &&
      <ul className="menu-list">
        {module.exceptions.map((e) =>
          <li key={e.name}>
            <Go to="exception" params={{module: module.name, exception: e.name}}>{e.name}</Go>
          </li>,
        )}
      </ul>}

      {!!module.decorators.length &&
      <p className="menu-label">
        Decorators
      </p>}
      {!!module.decorators.length &&
      <ul className="menu-list">
        {module.decorators.map((e) =>
          <li key={e.name}><Go to="decorator" params={{module: module.name, decorator: e.name}}>@{e.name}</Go></li>,
        )}
      </ul>}

      {!!module.components.length &&
      <p className="menu-label">
        Components
      </p>}
      {!!module.components.length &&
      <ul className="menu-list">
        {module.components.map((e) =>
          <li key={e.name}>
            <Go
              to="component"
              params={{module: module.name, component: e.name}}>{"<" + e.name + "/>"}
            </Go>
          </li>,
        )}
      </ul>}

      {!!module.services.filter((s) => s.name.indexOf("Provider") === -1).length &&
      <p className="menu-label">
        Services
      </p>}
      {!!module.services.filter((s) => s.name.indexOf("Provider") === -1).length &&
      <ul className="menu-list">
        {module.services.filter((s) => s.name.indexOf("Provider") === -1).map((e) =>
          <li key={e.name}>
            <Go to="service" params={{module: module.name, service: e.name}}>{e.name}</Go>
            {!!e.methods.length && this.router.isActive({
              to: "service",
              params: {module: module.name, service: e.name},
            }) && (
              <ul>
                {e.methods.map((method) => (
                  <li key={method.name}>
                    <Go to="method" params={{module: module.name, service: e.name, method: method.name}}>
                      {method.static ? "." : "#"}{method.name}()
                    </Go>
                  </li>
                ))}
              </ul>
            )}
          </li>,
        )}
      </ul>}

      {!!module.services.filter((s) => s.name.indexOf("Provider") > -1).length &&
      <p className="menu-label">
        Providers
      </p>}
      {!!module.services.filter((s) => s.name.indexOf("Provider") > -1).length &&

      <ul className="menu-list">
        {module.services.filter((s) => s.name.indexOf("Provider") > -1).map((e) =>
          <li key={e.name}>
            <Go to="service" params={{module: module.name, service: e.name}}>{e.name}</Go>
          </li>,
        )}
      </ul>}

    </div>;
  }

  getIcon(m: IModuleContent) {
    switch (m.type) {
      case "dev":
        return "fa fa-wrench";
      case "server":
        return "fa fa-server";
      default:
        return "fa fa-universal-access";
    }
  }
}
