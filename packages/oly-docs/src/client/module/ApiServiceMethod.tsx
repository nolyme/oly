import { attach } from "oly-react";
import * as React from "react";
import { IDocMethod, IDocService } from "../../shared/interfaces";
import { Prism } from "../layout/Prism";

@attach
export class ApiServiceMethod extends React.Component<{ service: IDocService; method: IDocMethod }, {}> {

  public render() {
    return (
      <div>
        <small className="pt-text-muted">Method</small>
        <h2>
          {this.props.service.name}#{this.props.method.name}()
        </h2>
        <p className="pt-text-muted">
          {this.props.service.name}#{this.props.method.name}(
          {this.props.method.parameters.map((prop, i) => (
            <span key={i}>
              <span>{(i ? ", " : "")}</span>
              <span>{prop.name + ": "}</span>
              <strong>{prop.type}</strong>
            </span>
          ))}
          )
          {": " + this.props.method.returnType}
        </p>
        <div className="separator"/>
        <h3>Description</h3>
        <Prism html={this.props.method.description}/>
        {this.props.method.parameters.length > 0 && (<div>
          <h3>Arguments</h3>
          <table className="pt-table pt-striped pt-bordered">
            <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Default</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
            </thead>
            <tbody>
            {this.props.method.parameters.map((prop) => (
              <tr key={prop.name}>
                <td><strong>{prop.name}</strong></td>
                <td><code>{prop.type.replace("undefined | ", "")}</code></td>
                <td><Prism html={prop.default || ""}/></td>
                <td>{(prop.optional || !!prop.default) ? "" : "true"}</td>
                <td><Prism html={prop.description}/></td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>)}
      </div>
    );
  }
}
