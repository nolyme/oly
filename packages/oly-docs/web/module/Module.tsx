import { attach } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../src/interfaces";
import { ModuleMenu } from "./ModuleMenu";

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
          <ModuleMenu module={this.props.module}/>
          <div className="flex-full">
            {React.cloneElement(this.props.children as any, {module: this.props.module})}
          </div>
        </div>
      </div>
    );
  }
}
