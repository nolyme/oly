import { attach, View } from "oly-react";
import { Helmet } from "oly-react-ssr";
import * as React from "react";
import { Component } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Header } from "./Header";

@attach
export class Layout extends Component<{}, {}> {

  public render() {
    return (
      <div className="flex flex-row">
        <Helmet>
          <title>Docs</title>
          <link rel="icon" href="favicon.png" sizes="64x64" type="image/png"/>
        </Helmet>
        <Header/>
        <div className="flex flex-row flex-full">
          <Breadcrumbs/>
          <View index={1}/>
        </div>
      </div>
    );
  }
}
