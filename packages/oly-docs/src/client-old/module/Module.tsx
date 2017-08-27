import { attach, View } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IModuleContent } from "../../shared/interfaces";
import { ModuleMenu } from "./ModuleMenu";

export class Module extends Component<{ module: IModuleContent }, {}> {

  div: HTMLElement | null;

  public render() {
    return (
      <div className="Module flex">
        <ModuleMenu module={this.props.module}/>
        <div
          ref={(div) => this.div = div}
          className="Module_view flex-full with-scroll"
        >
          <View onChange={() => {
            if (this.div) {
              this.div.scrollTop = 0;
            }
          }}/>
        </div>
      </div>
    );
  }
}
