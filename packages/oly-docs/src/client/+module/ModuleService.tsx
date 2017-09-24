import * as React from "react";
import { Component } from "react";
import { IDocMethod, IDocService } from "../../shared/interfaces";
import { Mark } from "../shared/Mark";

export interface IModuleServiceProps {
  service: IDocService;
  method: IDocMethod;
}

export interface IModuleServiceState {
}

export class ModuleService extends Component<IModuleServiceProps, IModuleServiceState> {

  public render() {
    const s = this.props.service;
    const m = this.props.method;
    return (
      <div>
        <h2 className="title">{s.name}{m.static ? "." : "#"}{m.name}{m.accessor ? "" : "()"}</h2>
        <h2 className="subtitle">
          {s.name}{m.static ? "." : "#"}{m.name}
          {this.renderDefinitions(m)}
          {": " + m.returnType}
        </h2>

        <div className="content">
          <h2>Description</h2>
        </div>
        <Mark html={m.description}/>
      </div>
    );
  }

  renderDefinitions(m: IDocMethod) {

    if (m.accessor) {
      return;
    }

    return (
      <span>
        {false}
        (
        {m.parameters.map((prop, i) => (
          <span key={i}>
              <span>{(i ? ", " : "")}</span>
              <span>{prop.name + ": "}</span>
              <strong>{prop.type}</strong>
            </span>
        ))}
        )
        {false}
      </span>
    );
  }
}
