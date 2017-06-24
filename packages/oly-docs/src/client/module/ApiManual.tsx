import { attach } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IDocManual, IModuleContent } from "../../shared/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiManual extends Component<{ module: IModuleContent; manual: IDocManual }, {}> {

  public render() {
    return (
      <div>
        <div className="Module_head">
          <h2>{this.props.manual.name}</h2>
        </div>
        <div className="separator"/>
        <div className="Module_body">
          <Prism html={this.props.manual.content}/>
        </div>
      </div>
    );
  }
}
