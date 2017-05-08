import { env } from "oly-core";
import { attach, Go } from "oly-react";
import * as React from "react";
import { IDoc, IModuleContent } from "../../src/interfaces";

@attach
export class Home extends React.Component<{}, {}> {

  @env("DOC")
  private doc: IDoc;

  public renderModule(m: IModuleContent) {
    return (
      <div key={m.name}>
        <Go to={`/m/${m.name}`}>{m.name}</Go>
      </div>
    );
  }

  public render() {
    return (
      <div className="pt-card">
        {this.doc.modules.map((m) => this.renderModule(m))}
      </div>
    );
  }
}
