import { Collapse } from "@blueprintjs/core";
import { inject } from "oly-core";
import { Active, attach, Go, Router, styles } from "oly-react";
import * as React from "react";
import { on } from "../../../../oly-core/src/kernel/decorators/on";
import { olyReactRouterEvents } from "../../../../oly-react/src/router/constants/events";
import { IModuleContent } from "../../cli/interfaces";

@attach
@styles(() => require("./ModuleMenu.scss"))
export class ModuleMenu extends React.Component<{ module: IModuleContent }, {

  isOpenServices: boolean;

}> {

  public state = {
    isOpenServices: true,
  };

  @inject
  private router: Router;

  public rel(path: string = ""): string {
    return `/m/${this.props.module.name}/${path}`;
  }

  @on(olyReactRouterEvents.TRANSITION_END)
  onTransitionEnd() {
    this.forceUpdate();
  }

  public renderServices() {
    if (this.props.module.services.length === 0) {
      return;
    }
    return (
      <div className="ModuleMenu_part">
        <div onClick={() => this.setState({isOpenServices: !this.state.isOpenServices})}>
          Services
        </div>
        <Collapse isOpen={this.state.isOpenServices}>
          {this.props.module.services.map((s) => (
            <div key={s.name}>
              <Go to="service" params={{service: s.name}}>{s.name}</Go>
              <Active href={{to: "service", params: {service: s.name}}}>
                {s.methods.map((m) => (
                  <div key={m.name} className="sub">
                    <Go to={this.rel(`s/${s.name}/${m.name}`)}>{m.static ? "." : "#"}{m.name}()</Go>
                  </div>
                ))}
              </Active>
            </div>
          ))}
        </Collapse>
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
        {this.props.module.env.length > 0 &&
        <div><Go strict={true} to={"configuration"}>Configuration</Go></div>
        }
        {this.renderDecorators()}
        {this.renderServices()}
      </div>
    );
  }
}
