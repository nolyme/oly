import { attach } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../shared/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ModuleIndex extends React.Component<{ module: IModuleContent }, {}> {

  public render() {
    return (
      <div className="Module_body">
        <Prism html={this.props.module.home}/>
      </div>
    );
  }
}
