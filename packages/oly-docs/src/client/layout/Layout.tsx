import { state } from "oly-core";
import { attach, View } from "oly-react";
import { Helmet } from "oly-react-ssr";
import * as React from "react";
import { Component } from "react";
import { IDocs } from "../../shared/interfaces";
import { Breadcrumbs } from "./Breadcrumbs";
import { Header } from "./Header";
import { Search } from "./Search";

@attach
export class Layout extends Component<{}, {}> {

  @state("DOCS") private docs: IDocs;

  public render() {
    return (
      <div className="flex flex-row flex-full">
        <Helmet>
          <title>Docs</title>
          <link rel="icon" href="favicon.png" sizes="64x64" type="image/png"/>
        </Helmet>
        <Header/>
        <div className="flex flex-row flex-full">
          <View index={1}/>
        </div>
      </div>
    );
  }
}
