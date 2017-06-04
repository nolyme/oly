import { state } from "oly-core";
import { attach } from "oly-react";
import * as React from "react";
import { IDocs } from "../../cli/interfaces";

@attach
export class Home extends React.Component<{}, {}> {

  @state("DOCS") docs: IDocs;

  public render() {
    return (
      <div className="pt-card">
        <div dangerouslySetInnerHTML={{__html: this.docs.home}}/>
      </div>
    );
  }
}
