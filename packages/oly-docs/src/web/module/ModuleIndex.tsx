import { attach } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../cli/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ModuleIndex extends React.Component<{ module: IModuleContent }, {}> {

  public render() {
    return (
      <div>
        <Prism html={this.props.module.home}/>
      </div>
    );
  }
}
