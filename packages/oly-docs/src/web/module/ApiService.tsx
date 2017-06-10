import { attach } from "oly-react";
import * as React from "react";
import { IDocService, IModuleContent } from "../../cli/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiService extends React.Component<{ module: IModuleContent; service: IDocService }, {}> {

  public render() {
    return (
      <div>
        <small className="pt-text-muted">Service</small>
        <h3>{this.props.service.name}</h3>
        <br/>
        <Prism html={this.props.service.description}/>
      </div>
    );
  }
}
