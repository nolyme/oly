import { attach, styles, View } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IModuleContent } from "../../cli/interfaces";
import { ModuleMenu } from "./ModuleMenu";

@attach
@styles(() => require("./Module.scss"))
export class Module extends Component<{ module: IModuleContent }, {}> {

  div: HTMLElement;

  public render() {
    return (
      <div className="Module flex">
        <ModuleMenu module={this.props.module}/>
        <div
          ref={(div) => this.div = div}
          className="Module_view flex-full with-scroll"
        >
          <View onChange={() => this.div.scrollTop = 0}/>
        </div>
      </div>
    );
  }
}
