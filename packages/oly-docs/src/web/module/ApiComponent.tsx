import { attach } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { IDocComponent, IModuleContent } from "../../cli/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiComponent extends Component<{ module: IModuleContent; component: IDocComponent }, {}> {

  public render() {
    return (
      <div>
        <small className="pt-text-muted">Component</small>
        <h3>{`<${this.props.component.name}/>`}</h3>
        <Prism html={this.props.component.description}/>
        <h4>Props</h4>
        <table className="pt-table pt-striped pt-bordered">
          <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
          </thead>
          <tbody>
          {this.props.component.props.concat().reverse().map((prop) => (
            <tr key={prop.name}>
              <td><strong>{prop.name}</strong></td>
              <td><code>{prop.type.replace("undefined | ", "")}</code></td>
              <td>{prop.optional ? "" : "true"}</td>
              <td><Prism html={prop.description}/></td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  }
}
