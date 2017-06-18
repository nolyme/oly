import { attach } from "oly-react";
import * as React from "react";
import { IDocService, IModuleContent } from "../../shared/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiService extends React.Component<{ module: IModuleContent; service: IDocService }, {}> {

  public render() {
    return (
      <div>
        <small className="pt-text-muted">Service</small>
        <h2>{this.props.service.name}</h2>
        <div className="separator"/>
        <Prism html={this.props.service.install} className="naked"/>
        <h3>Description</h3>
        <Prism html={this.props.service.description}/>
      </div>
    );
  }
}
