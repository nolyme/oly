import { Collapse } from "@blueprintjs/core";
import { attach, Go } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../src/interfaces";

@attach
export class ModuleMenu extends React.Component<{ module: IModuleContent }, { isDecoratorsOpen: boolean }> {

  state = {
    isDecoratorsOpen: true,
  };

  public rel(path: string = "") {
    return `/m/${this.props.module.name}/${path}`;
  }

  public renderServices() {
    if (this.props.module.services.length === 0) {
      return;
    }
    return (
      <div>
        <div>Services</div>
        {this.props.module.services.map((s) => (
          <div key={s.name}>
            <Go to={this.rel(`s/${s.name}`)}>{s.name}</Go>
            {s.methods.map((m) => (
              <div key={m.name} style={{paddingLeft: "10px", fontSize: "12px"}}>
                <Go to={this.rel(`s/${s.name}/${m.name}`)}>{m.static ? "." : "#"}{m.name}()</Go>
              </div>
            ))}
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
      <div>
        <div onClick={() => this.setState({isDecoratorsOpen: !this.state.isDecoratorsOpen})}>Decorators</div>
        <Collapse isOpen={this.state.isDecoratorsOpen}>
          {this.props.module.decorators.map((s) => (
            <div key={s.name}>
              <Go to={this.rel(`@/${s.name}`)}>{"@" + s.name}</Go>
            </div>
          ))}
        </Collapse>
      </div>
    );
  }

  public render() {
    return (
      <div style={{width: "200px"}}>
        <div><Go to={this.rel()}>General</Go></div>
        {this.renderServices()}
        {this.renderDecorators()}
      </div>
    );
  }
}
