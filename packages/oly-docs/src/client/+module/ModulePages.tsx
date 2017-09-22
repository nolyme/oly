import { inject, state } from "oly";
import { layout, page, param } from "oly-react";
import * as React from "react";
import { IModuleContent } from "../../shared/interfaces";
import { Docs } from "../services/Docs";
import { Mark } from "../shared/Mark";
import { Configuration } from "./Configuration";
import { Module } from "./Module";

export const GithubPath = (props: { module: string, path: string }) =>
  <h2 className="subtitle">
    <a
      style={{marginTop: "-20px"}}
      target="_blank"
      href={`https://github.com/nolyme/oly/blob/master/packages/${props.module}/src${props.path}`}>
      {props.path}
    </a>
  </h2>;

export class ModulePages {
  @inject docs: Docs;
  @state content: IModuleContent;

  @layout("/m/:module")
  module(@param("module") module: string) {
    this.content = this.docs.modules.find((m) => m.name === module)!;
    if (!this.content) {
      return <pre>Module Not Found</pre>;
    }
    return <Module module={this.content}/>;
  }

  @page
  index(@param("module") module: string) {
    return <Mark html={this.content.home}/>;
  }

  @page("/conf")
  configuration() {
    return <Configuration module={this.content}/>;
  }

  @page("/m/:manual")
  manual(@param("manual") manual: string) {
    const ma = this.content.manuals.find((m) => m.name === manual);
    if (!ma) {
      return <pre>Manual Not Found</pre>;
    }
    return <Mark html={ma.content}/>;
  }

  @page("/x/:exception")
  exception(@param("exception") exception: string) {
    const e = this.content.exceptions.find((m) => m.name === exception);
    if (!e) {
      return <pre>Exception Not Found</pre>;
    }
    return <div>
      <h2 className="title">{e.name}</h2>
      <GithubPath module={this.content.name} path={e.path}/>
      <Mark html={e.install}/>

      <div className="content">
        <h2>Description</h2>
      </div>
      <Mark html={e.description}/>
    </div>;
  }

  @page("/@/:decorator")
  decorator(@param("decorator") decorator: string) {
    const e = this.content.decorators.find((m) => m.name === decorator);
    if (!e) {
      return <pre>Decorator Not Found</pre>;
    }
    return <div>
      <h2 className="title">@{e.name}</h2>
      <GithubPath module={this.content.name} path={e.path}/>
      <Mark html={e.install}/>

      <div className="content">
        <h2>Description</h2>
      </div>
      <Mark html={e.description}/>
    </div>;
  }

  @page("/s/:service")
  service(@param("service") service: string) {
    const e = this.content.services.find((m) => m.name === service);
    if (!e) {
      return <pre>Service Not Found</pre>;
    }
    return <div>
      <h2 className="title">{e.name}</h2>
      <GithubPath module={this.content.name} path={e.path}/>
      <Mark html={e.install}/>

      <div className="content">
        <h2>Description</h2>
      </div>
      <Mark html={e.description}/>
    </div>;
  }

  @page("/s/:service/m/:method")
  method(@param("service") service: string, @param("method") method: string) {
    const e = this.content.services.find((m2) => m2.name === service);
    if (!e) {
      return <pre>Service Not Found</pre>;
    }
    const m = e.methods.find((m2) => m2.name === method);
    if (!m) {
      return <pre>Method Not Found</pre>;
    }
    return <div>
      <h2 className="title">{e.name}{m.static ? "." : "#"}{m.name}()</h2>
      <h2 className="subtitle">
        {e.name}{m.static ? "." : "#"}{m.name}(
        {m.parameters.map((prop, i) => (
          <span key={i}>
              <span>{(i ? ", " : "")}</span>
              <span>{prop.name + ": "}</span>
              <strong>{prop.type}</strong>
            </span>
        ))}
        )
        {": " + m.returnType}
      </h2>

      <div className="content">
        <h2>Description</h2>
      </div>
      <Mark html={m.description}/>
    </div>;
  }

  @page("/c/:component")
  component(@param("component") component: string) {
    const e = this.content.components.find((m) => m.name === component);
    if (!e) {
      return <pre>Component Not Found</pre>;
    }
    return <div>
      <h2 className="title">{"<" + e.name + "/>"}</h2>
      <GithubPath module={this.content.name} path={e.path}/>
      <Mark html={e.install}/>

      <div className="content">
        <h2>Description</h2>
      </div>
      <Mark html={e.description}/>

      <div className="content">
        <h2>Props</h2>
      </div>
      <table className="table is-striped links" style={{width: "100%"}}>
        <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
        </thead>
        <tbody>
        {e.props.sort((a) => a.optional ? 1 : -1).map((p) => (
          <tr key={p.name}>
            <td>
              <strong>{p.name}</strong>
              {" "}
              {!p.optional && (
               <em>{"(required)"}</em>
              )}
            </td>
            <td>
              <code>{p.type.replace("undefined | ", "")}</code>
            </td>
            <td>
              <Mark html={p.description}/>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>;
  }
}
