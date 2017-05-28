import { attach, Go } from "oly-react";
import * as React from "react";
import { IDocService, IModuleContent } from "../../cli/interfaces";

@attach
export class ApiService extends React.Component<{ module: IModuleContent; service: IDocService }, {}> {

  public render() {
    return (
      <div>
        Service {this.props.service.name}
        <div dangerouslySetInnerHTML={{__html: this.props.service.description}}/>
        {
          this.props.service.methods.map((s) => (
            <div key={s.name}>
              <Go to={`/m/${this.props.module.name}/s/${this.props.service.name}/${s.name}`}>
                {this.props.service.name}#{s.name}()
              </Go>
            </div>
          ))
        }
      </div>
    );
  }
}
