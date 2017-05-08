import { attach } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../src/interfaces";
import { ApiConfiguration } from "./ApiConfiguration";

@attach
export class ModuleIndex extends React.Component<{ module: IModuleContent }, {}> {

  public render() {
    return (
      <div>
        <h4>README.md</h4>
        <div dangerouslySetInnerHTML={{__html: this.props.module.home}}/>
        <ApiConfiguration module={this.props.module}/>
      </div>
    );
  }
}
