import { inject } from "oly-core";
import { Active, attach, Go, Router, styles } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../cli/interfaces";

@attach
@styles(() => require("./ModuleMenu.scss"))
export class ModuleMenu extends React.Component<{ module: IModuleContent }, {}> {

  public state = {
    isOpenServices: true,
  };

  @inject
  private router: Router;

  public rel(path: string = ""): string {
    return `/m/${this.props.module.name}/${path}`;
  }

  public renderServices(provider: boolean = false) {
    const services = this.props.module.services
      .filter((s) => s.name.includes("Provider")
        ? provider
        : !provider);
    if (services.length === 0) {
      return;
    }
    return (
      <div className="ModuleMenu_part">
        <div className="ModuleMenu_part-header">
          {!provider ? "Services" : "Providers"}
        </div>
        {services.map((s) => (
            <div key={s.name}>
              <Go to="service" params={{service: s.name}}>
                {s.name}
              </Go>
              <Active href={{to: "service", params: {service: s.name}}}>
                {s.methods.map((m) => (
                  <div key={m.name} className="sub">
                    <Go to={this.rel(`s/${s.name}/${m.name}`)}>{m.static ? "." : "#"}{m.name}()</Go>
                  </div>
                ))}
              </Active>
            </div>
          ))}
      </div>
    );
  }

  public renderDecorators() {
    if (this.props.module.decorators.length === 0) {
      return;
    }
    return (
      <div className="ModuleMenu_part">
        <div className="ModuleMenu_part-header">
          Decorators
        </div>
        {this.props.module.decorators.map((s) => (
          <div key={s.name}>
            <Go to={this.rel(`@/${s.name}`)}>{"@" + s.name}</Go>
          </div>
        ))}
      </div>
    );
  }

  public renderComponents() {
    if (this.props.module.components.length === 0) {
      return;
    }
    return (
      <div className="ModuleMenu_part">
        <div className="ModuleMenu_part-header">
          Components
        </div>
        {this.props.module.components.map((s) => (
          <div key={s.name}>
            <Go to={this.rel(`c/${s.name}`)}>{"<" + s.name + "/>"}</Go>
          </div>
        ))}
      </div>
    );
  }

  public renderManuals() {
    return this.props.module.manuals.map((m) => (
      <div key={m.name}>
        <Go to={this.rel(`m/${m.name}`)}>{m.name}</Go>
      </div>
    ));
  }

  public render() {
    return (
      <div className="ModuleMenu">
        <div><Go strict={true} to={this.rel()}>README</Go></div>
        {this.props.module.env.length > 0 &&
        <div><Go strict={true} to={"configuration"}>Configuration</Go></div>
        }
        {this.renderManuals()}
        {this.renderComponents()}
        {this.renderDecorators()}
        {this.renderServices()}
        {this.renderServices(true)}
      </div>
    );
  }
}
