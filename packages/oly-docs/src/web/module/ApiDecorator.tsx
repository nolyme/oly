import { attach } from "oly-react";
import * as React from "react";
import { IDocDecorator, IModuleContent } from "../../cli/interfaces";

@attach
export class ApiDecorator extends React.Component<{ module: IModuleContent; decorator: IDocDecorator }, {}> {

  public render() {
    return (
      <div>
        Decorator {this.props.decorator.name}
        <div dangerouslySetInnerHTML={{__html: this.props.decorator.description}}/>
      </div>
    );
  }
}
