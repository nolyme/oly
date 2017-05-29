import { inject } from "oly-core";
import { attach, Go, Router, styles } from "oly-react";
import * as React from "react";

@attach
@styles(() => require("./Breadcrumbs.scss"))
export class Breadcrumbs extends React.Component<{}, {}> {

  @inject private router: Router;
  private steps: string[];
  private stepsAllowed: string[];

  private blackList = [
    "m", "s", "@",
  ];

  private transforms: { [key: string]: (before: string) => string } = {
    decorator: (decorator) => `@${decorator}`,
    method: (method) => `#${method}()`,
    module: (module) => module.replace("oly-", ""),
  };

  public transform(value: string): string {
    const history: any = this.router;
    const kvs = Object.keys(history.params).map((key) => ({key, value: history.params[key]}));
    const match = kvs.filter((kv) => kv.value === value)[0];
    if (!match) {
      return value;
    }
    const transform = this.transforms[match.key];
    if (!transform) {
      return value;
    }
    return transform(value);
  }

  public build() {
    this.steps = location.pathname.split("/").filter((s) => !!s);
    this.stepsAllowed = this.steps.filter((s) => this.blackList.indexOf(s) === -1);
  }

  public chain(item: any): string {
    return this.steps.slice(0, this.steps.indexOf(item) + 1).join("/");
  }

  public render() {
    this.build();
    return (
      <div className="breadcrumbs">
        {this.stepsAllowed.length > 0 &&
        <ul className="pt-breadcrumbs">
          <li>
            <Go className="pt-breadcrumb" to="/">
              <span className="pt-icon-standard pt-icon-home breadcrumb-icon"/>
            </Go>
          </li>
          {this.stepsAllowed.map((s, index) => (
            <li key={s}>
              {(index === this.stepsAllowed.length - 1)
                ? <span className="pt-breadcrumb pt-breadcrumb-current">{this.transform(s)}</span>
                : <Go className="pt-breadcrumb" to={`/${this.chain(s)}`}>{this.transform(s)}</Go>}
            </li>
          ))}
        </ul>
        }
      </div>
    );
  }
}