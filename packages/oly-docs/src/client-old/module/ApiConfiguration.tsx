import { attach, Go } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../shared/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiConfiguration extends React.Component<{ module: IModuleContent }, {}> {

  public render() {
    return (
      <div>
        <div className="Module_head">
          <h2>Configuration</h2>
        </div>
        <div className="separator"/>
        <div className="Module_body">
          <table className="pt-table pt-striped pt-bordered">
            <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Target</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
            </thead>
            <tbody>
            {this.props.module.env.map((env) => (
              <tr key={env.name}>
                <td><strong>{env.name}</strong></td>
                <td><code>{env.type}</code></td>
                <td><Go
                  to="service"
                  params={{service: env.target}}
                >
                  {env.target}
                </Go>
                </td>
                <td>{env.default}</td>
                <td ><Prism html={env.description}/></td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
