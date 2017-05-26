import { _, inject } from "oly-core";
import * as React from "react";
import { View } from "../../src/router/components/View";
import { layout } from "../../src/router/decorators/layout";
import { page } from "../../src/router/decorators/page";
import { Router } from "../../src/router/services/Router";

export class FakeNestedApp {

  @inject(Router)
  public router: Router;

  @page("/")
  public list() {
    return <div>List</div>;
  }

  @page("/:id")
  public details() {
    return <div>Details({this.router.params.id})</div>;
  }
}

export class FakeApp {

  @layout
  public layout() {
    return <div>Layout:<View/></div>;
  }

  @page("/")
  public home() {
    return <div>Home</div>;
  }

  @page("/nested", {
    children: [FakeNestedApp],
  })
  public async nested() {
    await _.timeout(10);
    return <div>Nested:<View/></div>;
  }
}
