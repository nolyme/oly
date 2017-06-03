import { attach, Helmet, View } from "oly-react";
import * as React from "react";
import { IDoc } from "../../cli/interfaces";
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
          <link rel="icon" href="favicon.png" sizes="64x64" type="image/png"/>
        </Helmet>
        <Header doc={this.props.doc}/>
        <div className="flex-full container">
          <div style={{padding: "10px"}}><Breadcrumbs/></div>
          <View index={1}/>
        </div>
        <Footer/>
      </div>
    );
  }
}
