import { state } from "oly-core";
import { attach, View } from "oly-react";
import { Helmet } from "oly-react-ssr";
import * as React from "react";
import { Component } from "react";
import { IDocs } from "../../shared/interfaces";
import { Header } from "./Header";

@attach
export class Layout extends Component<{}, {}> {

  @state("DOCS") private docs: IDocs;

  public render() {
    return (
      <div className="flex flex-row flex-full">
        <Helmet>
          <title>Docs</title>
          <link rel="icon" href="favicon.png" sizes="64x64" type="image/png"/>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        </Helmet>
        <Header/>
        <div className="flex flex-row flex-full">
          <View index={1}/>
        </div>
      </div>
    );
  }
}
