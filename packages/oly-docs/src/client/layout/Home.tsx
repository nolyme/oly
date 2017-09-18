import { inject } from "oly";
import { Go } from "oly-react";
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
      <div>
        <section className="hero is-primary is-bold is-medium">
          <div className="hero-body">
            <div className="container" style={{textAlign: "center"}}>
              <div className="oly">
                o<em>l</em>y
              </div>
            </div>
          </div>
        </section>
        <div className="container">
          <div style={{margin: "100px"}}>
            <Mark html={this.docs.data.home}/>
          </div>
        </div>
      </div>
    );
  }
}
