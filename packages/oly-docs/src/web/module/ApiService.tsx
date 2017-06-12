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
        <h2>{this.props.service.name}</h2>
        <Prism html={this.props.service.install}/>
        <h3>Description</h3>
        <Prism html={this.props.service.description}/>
      </div>
    );
  }
}
