import { state } from "oly-core";
import { attach } from "oly-react";
import * as React from "react";

@attach
export class Home extends React.Component<{}, {}> {

  @state name;

  public render() {
    return (
      <div style={{width: "100%", marginTop: "200px", textAlign: "center"}}>
        <h1>Hello {this.name} !</h1>
        <input value={this.name} onChange={(e) => this.name = e.target.value}/>
      </div>
    );
  }
}
