import { attach } from "oly-react";
import { View } from "oly-react/src/router/components/View";
import * as React from "react";
import { Component } from "react";
import { IModuleContent } from "../../cli/interfaces";
import { ModuleMenu } from "./ModuleMenu";

@attach
export class Module extends Component<{ module: IModuleContent }, {}> {

  public render() {
    return (
      <div className="pt-card">
        <div className="flex">
          <ModuleMenu module={this.props.module}/>
          <div className="flex-full">
            <View index={2}/>
          </div>
        </div>
      </div>
    );
  }
}
