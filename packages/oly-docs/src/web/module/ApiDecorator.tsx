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
        <h3>@{this.props.decorator.name}</h3>
        <Prism html={this.props.decorator.description}/>
      </div>
    );
  }
}
