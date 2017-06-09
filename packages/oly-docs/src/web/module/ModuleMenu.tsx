import { attach, Go, styles } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../cli/interfaces";

@attach
@styles(() => require("./ModuleMenu.scss"))
export class ModuleMenu extends React.Component<{ module: IModuleContent }, {}> {

  public state = {
    isDecoratorsOpen: true,
    isServiceOpen: true,
  };

  public rel(path: string = ""): string {
    return `/m/${this.props.module.name}/${path}`;
  }

  public renderServices() {
    if (this.props.module.services.length === 0) {
      return;
    }
    return (
      <div className="ModuleMenu_part">
        <div>
          Services
        </div>
        {this.props.module.services.map((s) => (
          <div key={s.name}>
            <Go to={this.rel(`s/${s.name}`)}>{s.name}</Go>
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
        <div>
          Decorators
        </div>
        {this.props.module.decorators.map((s) => (
          <div key={s.name}>
            <div className="aoad"/>
            <Go to={this.rel(`@/${s.name}`)}>{"@" + s.name}</Go>
          </div>
        ))}
      </div>
    );
  }

  public render() {
    return (
      <div className="ModuleMenu">
        <div><Go strict={true} to={this.rel()}>README</Go></div>
        <div><Go strict={true} to={"configuration"}>Configuration</Go></div>
        {this.renderDecorators()}
        {this.renderServices()}
      </div>
    );
  }
}
