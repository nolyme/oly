import { inject } from "oly";
import * as React from "react";
import { Component } from "react";
import { Docs } from "../services/Docs";
import { Mark } from "../shared/Mark";

export interface IHomeProps {
}

export interface IHomeState {
}

export class Home extends Component<IHomeProps, IHomeState> {
  @inject docs: Docs;

  public render(): JSX.Element {
    return (
      <div className="container">
        <br/>
        <br/>
        <Mark html={this.docs.data.home}/>
      </div>
    );
  }
}
