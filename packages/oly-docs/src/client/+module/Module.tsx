import { inject } from "oly";
import { View } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IModuleContent } from "../../shared/interfaces";
import { Docs } from "../services/Docs";
import { Breadcrumb } from "./Breadcrumb";

export interface IModuleProps {
  module: IModuleContent;
}

export interface IModuleState {
}

export class Module extends Component<IModuleProps, IModuleState> {
  @inject docs: Docs;

  div: any;

  public render(): JSX.Element {
    return (
      <div className="Module" ref={(el) => this.div = el}>
        <div className="container">
          <Breadcrumb/>
          <br/>
          <View onChange={() =>
            this.div ? this.div.scrollTop = 0 : undefined
          }/>
          <br/>
        </div>
      </div>
    );
  }
}
