import { attach } from "oly-react";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Breadcrumbs } from "./Breadcrumbs";
import { Footer } from "./Footer";
import { Header } from "./Header";

@attach
export class Layout extends React.Component<{}, {}> {

  public render() {
    return (
      <div className="flex flex-row">
        <Helmet>
          <title>oly/docs</title>
        </Helmet>
        <Header/>
        <div className="flex-full container">
          <div style={{padding: "40px"}}><Breadcrumbs/></div>
          {this.props.children}
        </div>
        <Footer/>
      </div>
    );
  }
}
