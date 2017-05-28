import { _, inject } from "oly-core";
import * as React from "react";
import { Go } from "../../src/router/components/Go";
import { View } from "../../src/router/components/View";
import { layout } from "../../src/router/decorators/layout";
import { page } from "../../src/router/decorators/page";
import { page404 } from "../../src/router/decorators/page404";
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

  @page("/back")
  public back() {
    return <div><Go id="go" to="home">Back</Go></div>;
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

  @page404
  public notFound() {
    return <div>NotFound</div>;
  }

  @page("/nested", {
    children: [FakeNestedApp],
  })
  public async nested() {
    await _.timeout(10);
    return <div>Nested:<View/></div>;
  }
}
