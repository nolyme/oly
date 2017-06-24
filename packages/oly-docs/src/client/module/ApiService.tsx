import { attach } from "oly-react";
import * as React from "react";
import { IDocService, IModuleContent } from "../../shared/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiService extends React.Component<{ module: IModuleContent; service: IDocService }, {}> {

  public render() {
    return (
      <div>
        <div className="Module_head">
          <small className="pt-text-muted">Service</small>
          <h2>{this.props.service.name}</h2>
        </div>
        <div className="separator"/>
        <div className="Module_body">
          <Prism html={this.props.service.install} className="naked"/>
          <h3>Description</h3>
          <Prism html={this.props.service.description}/>
        </div>
      </div>
    );
  }
}
