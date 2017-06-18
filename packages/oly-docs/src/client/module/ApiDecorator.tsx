import { attach } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IDocDecorator, IModuleContent } from "../../shared/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiDecorator extends Component<{ module: IModuleContent; decorator: IDocDecorator }, {}> {

  public render() {
    return (
      <div>
        <small className="pt-text-muted">Decorator</small>
        <h2>@{this.props.decorator.name}</h2>
        <div className="separator"/>
        <Prism html={this.props.decorator.install} className="naked"/>
        <h3>Description</h3>
        <Prism html={this.props.decorator.description}/>
      </div>
    );
  }
}
