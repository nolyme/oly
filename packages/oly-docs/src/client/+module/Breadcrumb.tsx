import { inject } from "oly";
import { Browser, Go, Router } from "oly-react";
import * as React from "react";
import { Component } from "react";
import Helmet from "react-helmet";

export interface IBreadcrumbProps {
}

export interface IBreadcrumbState {
}

export class Breadcrumb extends Component<IBreadcrumbProps, IBreadcrumbState> {
  @inject router: Router;
  @inject browser: Browser;

  steps: string[];
  stepsAllowed: string[];

  blackList = [
    "c", "s", "@", "m", "x",
  ];

  transforms: { [key: string]: (before: string) => string } = {
    decorator: (decorator) => `@${decorator}`,
    method: (method) => `#${method}()`,
    component: (component) => `<${component}/>`,
    manual: (manual) => `${manual}.md`,
    module: (module) => module.replace("oly-", ""),
  };

  transform(value: string): string {
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

  build() {
    this.steps = this.router.current.path.split("/").filter((s) => !!s);
    this.stepsAllowed = this.steps.filter((s) => this.blackList.indexOf(s) === -1);
  }

  chain(item: any): string {
    return this.steps.slice(0, this.steps.indexOf(item) + 1).join("/");
  }

  render() {
    this.build();
    if (this.stepsAllowed.length <= 0) {
      return <div/>;
    }
    return (
      <div className="breadcrumbs">
        <Helmet>
          <title>Docs ~ {this.stepsAllowed[this.stepsAllowed.length - 1] || "home"}</title>
        </Helmet>
        <nav className="breadcrumb is-hidden-mobile" aria-label="breadcrumbs">
          <ul>
            <li>
              <Go to="/">
                <i className="fa fa-home" aria-hidden="true"/>
              </Go>
            </li>
            {this.stepsAllowed.map((s, index) => (
              (index === this.stepsAllowed.length - 1)
                ? <li key={s} className="is-active"><a>{this.transform(s)}</a></li>
                : <li key={s}><Go to={`/${this.chain(s)}`}>{this.transform(s)}</Go></li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }
}
