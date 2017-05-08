import { attach, Go } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../src/interfaces";

@attach
export class Module extends React.Component<{ module: IModuleContent }, {}> {

  public rel(path: string = "") {
    return `/m/${this.props.module.name}/${path}`;
  }

  public render() {
    return (
      <div className="pt-card">
        Module {this.props.module.name}
        <div className="flex">
          <div style={{width: "200px"}}>
            <h3>General</h3>
            <div><Go to={this.rel()}>Readme</Go></div>
            <div><Go to={this.rel("env")}>Configuration</Go></div>
            <h3>Services</h3>
            {this.props.module.services.map((s) => (
              <div key={s.name}>
                <Go to={this.rel(`s/${s.name}`)}>{s.name}</Go>
              </div>
            ))}
            <h3>Decorators</h3>
            {this.props.module.decorators.map((s) => (
              <div key={s.name}>
                <Go to={this.rel(`@/${s.name}`)}>{"@" + s.name}</Go>
              </div>
            ))}
          </div>
          <div className="flex-full">
            {React.cloneElement(this.props.children as any, {module: this.props.module})}
          </div>
        </div>
      </div>
    );
  }
}
