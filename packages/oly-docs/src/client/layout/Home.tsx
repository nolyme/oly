import { state } from "oly";
import * as React from "react";
import { Component } from "react";
import { IDocs } from "../../shared/interfaces";
import { Prism } from "./Prism";

export class Home extends Component {

  @state("DOCS") docs: IDocs;

  public render() {
    return (
      <div className="Home">
        <div>
          <Prism html={this.docs.home}/>
        </div>
      </div>
    );
  }
}
