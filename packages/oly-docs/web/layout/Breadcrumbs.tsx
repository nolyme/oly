import { inject, on, state } from "oly-core";
import { attach, Go, Router, TRANSITION_FINISH } from "oly-react";
import * as React from "react";

@attach
export class Breadcrumbs extends React.Component<{}, {}> {

  @inject private router: Router;
  @state private steps: string[];

  private blackList = [
    "m", "s", "@",
  ];

  public componentWillMount() {
    this.build();
  }

  @on(TRANSITION_FINISH)
  public transition() {
    this.build();
  }

  public build() {
    this.steps = this.router.current.pathname
      .split("/")
      .filter((s) => !!s);
  }

  public chain(item: any): string {
    return this.steps.slice(0, this.steps.indexOf(item) + 1).join("/");
  }

  public render() {
    return (
      <div>
        <ul className="pt-breadcrumbs">
          <li><Go className="pt-breadcrumb" to="/">root</Go></li>
          {this.steps.filter((s) => this.blackList.indexOf(s) === -1).map((s) => (
            <li key={s}><Go className="pt-breadcrumb" to={`/${this.chain(s)}`}>{s}</Go></li>
          ))}
        </ul>
      </div>
    );
  }
}
