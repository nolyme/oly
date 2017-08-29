import { inject } from "oly";
import { Go, Router, View } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IModuleContent } from "../../shared/interfaces";
import { Docs } from "../services/Docs";

export interface IModuleProps {
  module: IModuleContent;
}

export interface IModuleState {
}

export class Module extends Component<IModuleProps, IModuleState> {
  @inject docs: Docs;
  @inject router: Router;

  div: HTMLElement | null;

  public render(): JSX.Element {
    return (
      <div style={{paddingLeft: "250px"}}>
        <section
          style={{position: "fixed", top: "52px", width: "100%", zIndex: -1}}
          className="hero is-small is-primary is-bold">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">
                {this.props.module.name}
              </h1>
              <h2 className="subtitle">
                v{this.props.module.version}
              </h2>
            </div>
          </div>
        </section>
        <div className="module-content">

          <aside className="menu">

            <p className="menu-label">
              General
            </p>
            <ul className="menu-list">
              <li><Go to="module.index" strict={true}>README</Go></li>
              {!!this.props.module.env.length && <li><Go to="configuration">Configuration</Go></li>}
              {this.props.module.manuals.map((e) =>
                <li key={e.name}><Go to="manual" params={{manual: e.name}}>{e.name}</Go></li>,
              )}
            </ul>

            {!!this.props.module.exceptions.length &&
            <p className="menu-label">
              Exceptions
            </p>}
            {!!this.props.module.exceptions.length &&
            <ul className="menu-list">
              {this.props.module.exceptions.map((e) =>
                <li key={e.name}><Go to="exception" params={{exception: e.name}}>{e.name}</Go></li>,
              )}
            </ul>}

            {!!this.props.module.decorators.length &&
            <p className="menu-label">
              Decorators
            </p>}
            {!!this.props.module.decorators.length &&
            <ul className="menu-list">
              {this.props.module.decorators.map((e) =>
                <li key={e.name}><Go to="decorator" params={{decorator: e.name}}>@{e.name}</Go></li>,
              )}
            </ul>}

            {!!this.props.module.components.length &&
            <p className="menu-label">
              Components
            </p>}
            {!!this.props.module.components.length &&
            <ul className="menu-list">
              {this.props.module.components.map((e) =>
                <li key={e.name}><Go to="component" params={{component: e.name}}>{"<" + e.name + "/>"}</Go></li>,
              )}
            </ul>}

            {!!this.props.module.services.filter((s) => s.name.indexOf("Provider") === -1).length &&
            <p className="menu-label">
              Services
            </p>}
            {!!this.props.module.services.filter((s) => s.name.indexOf("Provider") === -1).length &&
            <ul className="menu-list">
              {this.props.module.services.filter((s) => s.name.indexOf("Provider") === -1).map((e) =>
                <li key={e.name}>
                  <Go to="service" params={{service: e.name}}>{e.name}</Go>
                  {!!e.methods.length && this.router.isActive({to: "service", params: {service: e.name}}) && (
                    <ul>
                      {e.methods.map((method) => (
                        <li key={method.name}>
                          <Go to="method" params={{service: e.name, method: method.name}}>#{method.name}()</Go>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>,
              )}
            </ul>}

            {!!this.props.module.services.filter((s) => s.name.indexOf("Provider") > -1).length &&
            <p className="menu-label">
              Providers
            </p>}
            {!!this.props.module.services.filter((s) => s.name.indexOf("Provider") > -1).length &&

            <ul className="menu-list">
              {this.props.module.services.filter((s) => s.name.indexOf("Provider") > -1).map((e) =>
                <li key={e.name}><Go to="service" params={{service: e.name}}>{e.name}</Go></li>,
              )}
            </ul>}

          </aside>
          <div style={{padding: "20px"}}>
            <View/>
          </div>
        </div>
      </div>
    );
  }
}
