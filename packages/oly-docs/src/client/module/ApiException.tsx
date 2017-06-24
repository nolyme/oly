import { attach } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IDocException, IModuleContent } from "../../shared/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiException extends Component<{ module: IModuleContent; exception: IDocException }, {}> {

  public render() {
    return (
      <div>
        <div className="Module_head">
          <small className="pt-text-muted">Exception</small>
          <h2>{this.props.exception.name}</h2>
        </div>
        <div className="separator"/>
        <div className="Module_body">
          <Prism html={this.props.exception.install} className="naked"/>
          <h3>Description</h3>
          <Prism html={this.props.exception.description}/>
        </div>
      </div>
    );
  }
}
