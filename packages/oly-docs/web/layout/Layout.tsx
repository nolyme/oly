import { state } from "oly-core";
import { attach } from "oly-react";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Breadcrumbs } from "./Breadcrumbs";

@attach
export class Layout extends React.Component<{}, {}> {

  @state("THEME") private theme: string = "pt-light";

  public render() {
    return (
      <div className="flex flex-row">
        <Helmet>
          <title>oly / docs</title>
          <body className={this.theme}/>
        </Helmet>
        <Header/>
        <div className="flex-full container">
          <Breadcrumbs/>
          {this.props.children}
        </div>
        <Footer/>
      </div>
    );
  }
}
