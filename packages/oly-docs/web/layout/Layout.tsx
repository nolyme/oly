import { attach } from "oly-react";
import * as React from "react";
import { Helmet } from "react-helmet";
import { IDoc } from "../../src/interfaces";
import { Breadcrumbs } from "./Breadcrumbs";
import { Footer } from "./Footer";
import { Header } from "./Header";

@attach
export class Layout extends React.Component<{ doc: IDoc }, {}> {

  public render() {
    return (
      <div className="flex flex-row">
        <Helmet>
          <title>oly/docs</title>
        </Helmet>
        <Header doc={this.props.doc}/>
        <div className="flex-full container">
          <div style={{padding: "10px"}}><Breadcrumbs/></div>
          {this.props.children}
        </div>
        <Footer/>
      </div>
    );
  }
}
