import { inject, Kernel } from "oly";
import { action, Go } from "oly-react";
import * as React from "react";
import { Component } from "react";
import { Search } from "./Search";

export interface INavbarProps {
}

export interface INavbarState {
}

export class Navbar extends Component<INavbarProps, INavbarState> {
  @inject kernel: Kernel;

  @action toggleSidebar() {
    this.kernel.state("Sidebar.isOpen", !this.kernel.state("Sidebar.isOpen"));
  }

  public render() {
    return (
      <div className="Navbar">
        <div className="Navbar__box">
          <button
            className="Navbar__menu  button is-large is-white"
            onClick={this.toggleSidebar}
          >
             <span className="icon">
               <i className="fa fa-bars"/>
             </span>
          </button>
        </div>
        <div className="Navbar__box is-hidden-mobile" style={{paddingRight: "20px"}}>
          <Go
            strict={true}
            to="home"
            className="Navbar__home button is-white"
          >
            o<em>l</em>y
          </Go>
        </div>
        <div className="Navbar__box is-full" style={{paddingRight: "20px"}}>
          <Search/>
        </div>
        <div className="Navbar__box is-hidden-mobile">
          <a target="_blank"
             href="https://github.com/nolyme/oly"
             className="Navbar__home button is-large is-white"
             onClick={this.toggleSidebar}
          >
            <span className="icon ">
               <i className="fa fa-github"/>
             </span>
          </a>
        </div>
      </div>
    );
  }
}
