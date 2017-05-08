import { attach, Go } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../src/interfaces";

@attach
export class ModuleMenu extends React.Component<{ module: IModuleContent }, {}> {

  public rel(path: string = "") {
    return `/m/${this.props.module.name}/${path}`;
  }

  public render() {
    return (
      <div style={{width: "200px"}}>
        <div><Go to={this.rel()}>General</Go></div>
        <span>Services</span>
        {this.props.module.services.map((s) => (
          <div key={s.name}>
            <Go to={this.rel(`s/${s.name}`)}>{s.name}</Go>
            {s.methods.map((m) => (
              <div key={m.name} style={{paddingLeft: "10px", fontSize: "12px"}}>
                {
                  m.static
                    ? <Go to={this.rel(`s/${s.name}/${m.name}`)}>.{m.name}()</Go>
                    : <Go to={this.rel(`s/${s.name}/${m.name}`)}>#{m.name}()</Go>
                }
              </div>
            ))}
          </div>
        ))}
        <span>Decorators</span>
        {this.props.module.decorators.map((s) => (
          <div key={s.name}>
            <Go to={this.rel(`@/${s.name}`)}>{"@" + s.name}</Go>
          </div>
        ))}
      </div>
    );
  }
}
