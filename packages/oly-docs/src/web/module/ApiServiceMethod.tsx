import { attach } from "oly-react";
import * as React from "react";
import { IDocMethod, IDocService } from "../../cli/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiServiceMethod extends React.Component<{ service: IDocService; method: IDocMethod }, {}> {

  public render() {
    return (
      <div>
        <small className="pt-text-muted">Method</small>
        <h3>{this.props.service.name}#{this.props.method.name}()</h3>
        <br/>
        <Prism html={this.props.method.description}/>
      </div>
    );
  }
}
