import { state } from "oly-core";
import { attach, styles } from "oly-react";
import * as React from "react";
import { IDocs } from "../../cli/interfaces";
import { Prism } from "./Prism";

@attach
@styles(() => require("./Home.scss"))
export class Home extends React.Component<{}, {}> {

  @state("DOCS") docs: IDocs;

  public render() {
    return (
      <div className="Home">
        <Prism html={this.docs.home}/>
      </div>
    );
  }
}
