import { attach } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../cli/interfaces";

@attach
export class ModuleIndex extends React.Component<{ module: IModuleContent }, {}> {

  public render() {
    return (
      <div>
        <div dangerouslySetInnerHTML={{__html: this.props.module.home}}/>
      </div>
    );
  }
}
