import { attach, styles, View } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IModuleContent } from "../../cli/interfaces";
import { ModuleMenu } from "./ModuleMenu";

@attach
@styles(() => require("./Module.scss"))
export class Module extends Component<{ module: IModuleContent }, {}> {

  public render() {
    return (
      <div className="Module flex">
        <ModuleMenu module={this.props.module}/>
        <div className="Module_view flex-full with-scroll">
          <View index={2}/>
        </div>
      </div>
    );
  }
}
