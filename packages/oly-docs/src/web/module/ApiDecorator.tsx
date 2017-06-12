import { attach } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IDocDecorator, IModuleContent } from "../../cli/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiDecorator extends Component<{ module: IModuleContent; decorator: IDocDecorator }, {}> {

  public render() {
    return (
      <div>
        <small className="pt-text-muted">Decorator</small>
        <h2>@{this.props.decorator.name}</h2>
        <Prism html={this.props.decorator.install}/>
        <h3>Description</h3>
        <Prism html={this.props.decorator.description}/>
      </div>
    );
  }
}
