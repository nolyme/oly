import { inject, on } from "oly-core";
import { attach, Browser, Go, Helmet, olyReactRouterEvents, Router, styles } from "oly-react";
import * as React from "react";

@attach
@styles(() => require("./Breadcrumbs.scss"))
export class Breadcrumbs extends React.Component<{}, {}> {

  @inject private router: Router;
  @inject private browser: Browser;

  private steps: string[];
  private stepsAllowed: string[];

  private blackList = [
    "c", "s", "@", "m", "x", "oly",
  ];

  private transforms: { [key: string]: (before: string) => string } = {
    decorator: (decorator) => `@${decorator}`,
    method: (method) => `#${method}()`,
    component: (component) => `<${component}/>`,
    manual: (manual) => `${manual}.md`,
    module: (module) => module.replace("oly-", ""),
  };

  public transform(value: string): string {
    const kvs = Object.keys(this.router.current.params).map((key) => ({key, value: this.router.current.params[key]}));
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
    this.steps = this.router.current.path.split("/").filter((s) => !!s);
    this.stepsAllowed = this.steps.filter((s) => this.blackList.indexOf(s) === -1);
  }

  public chain(item: any): string {
    return this.steps.slice(0, this.steps.indexOf(item) + 1).join("/");
  }

  @on(olyReactRouterEvents.TRANSITION_RENDER)
  public onTransitionRender() {
    this.forceUpdate();
  }

  public render() {
    this.build();
    if (this.stepsAllowed.length <= 0) {
      return <div/>;
    }
    return (
      <div className="breadcrumbs">
        <Helmet>
          <title>Docs ~ {this.stepsAllowed[this.stepsAllowed.length - 1] || "home"}</title>
        </Helmet>
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
      </div>
    );
  }
}
