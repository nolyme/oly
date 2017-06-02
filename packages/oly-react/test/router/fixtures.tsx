import { _ } from "oly-core";
import * as React from "react";
import { Go } from "../../src/router/components/Go";
import { View } from "../../src/router/components/View";
import { layout } from "../../src/router/decorators/layout";
import { page } from "../../src/router/decorators/page";
import { page404 } from "../../src/router/decorators/page404";
import { param } from "../../src/router/decorators/param";
import { query } from "../../src/router/decorators/query";

export class UserApp {

  @page("/")
  public list() {
    return <div>List</div>;
  }

  @page("/:id")
  public details(@param id: string, @query("name") name: string) {
    return <div>Details({id},{name})</div>;
  }

  @page("/back")
  public back() {
    return <div><Go id="go" to="home">Back</Go></div>;
  }
}

export class ShopApp {

  @page("/")
  public catalog() {
    return <div>Shop</div>;
  }
}

export class App {

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

  @page({
    children: [UserApp],
    path: "/users",
  })
  public async users() {
    await _.timeout(10);
    return <div>Users:<View/></div>;
  }

  @page({
    children: [ShopApp],
    path: "/shop",
  })
  public shop() {
    return <View/>;
  }
}
