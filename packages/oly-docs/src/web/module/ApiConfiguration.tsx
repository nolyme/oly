import { attach, Go } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../cli/interfaces";

@attach
export class ApiConfiguration extends React.Component<{ module: IModuleContent }, {}> {

  public render() {
    return (
      <div>
        <h2>Configuration</h2>
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
              <td dangerouslySetInnerHTML={{__html: env.description}}/>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  }
}
