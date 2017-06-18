import { attach } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IDocException, IModuleContent } from "../../cli/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiException extends Component<{ module: IModuleContent; exception: IDocException }, {}> {

  public render() {
    return (
      <div>
        <small className="pt-text-muted">Exception</small>
        <h2>{this.props.exception.name}</h2>
        <div className="separator"/>
        <Prism html={this.props.exception.install} className="naked"/>
        <h3>Description</h3>
        <Prism html={this.props.exception.description}/>
      </div>
    );
  }
}
