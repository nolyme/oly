import { attach } from "oly-react";
import * as React from "react";
import { IDoc } from "../../cli/interfaces";

@attach
export class Home extends React.Component<{ doc: IDoc }, {}> {

  public render() {
    return (
      <div className="pt-card">
        <div dangerouslySetInnerHTML={{__html: this.props.doc.home}}/>
      </div>
    );
  }
}
