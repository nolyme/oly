import { attach } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../src/interfaces";

@attach
export class ApiConfiguration extends React.Component<{ module: IModuleContent }, {}> {

  public render() {
    return (
      <div>
        Configuration
        <div>
          {this.props.module.env.map((env) => (
            <div key={env.name}>
              {env.name}
              {env.type}
              {env.description}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
