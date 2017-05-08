import { attach } from "oly-react";
import * as React from "react";
import { IDocMethod, IDocService } from "../../src/interfaces";

@attach
export class ApiServiceMethod extends React.Component<{ service: IDocService; method: IDocMethod }, {}> {

  public render() {
    return (
      <div>
        <div>Service {this.props.service.name}</div>
        <div>
          PROPERTY # {this.props.method.name}
          <div dangerouslySetInnerHTML={{__html: this.props.method.description}}/>
        </div>
      </div>
    );
  }
}
