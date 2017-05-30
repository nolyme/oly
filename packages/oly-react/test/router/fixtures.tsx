import { _ } from "oly-core";
import * as React from "react";
import { Go } from "../../src/router/components/Go";
import { View } from "../../src/router/components/View";
import { layout } from "../../src/router/decorators/layout";
import { page } from "../../src/router/decorators/page";
import { page404 } from "../../src/router/decorators/page404";
import { path } from "../../src/router/decorators/path";
import { query } from "../../src/router/decorators/query";

export class FakeNestedApp {

  @page("/")
  public list() {
    return <div>List</div>;
  }

  @page("/:id")
  public details(@path("id") id: string, @query("name") name: string) {
    return <div>Details({id},{name})</div>;
  }

  @page("/back")
  public back() {
    return <div><Go id="go" to="home">Back</Go></div>;
  }
}

export class Fake2 {

  @page("/")
  public victory() {
    return <div>Victory</div>;
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

  @page("/nested2", {
    children: [Fake2],
  })
  public nested2() {
    return <div>Nested2:<View/></div>;
  }
}
