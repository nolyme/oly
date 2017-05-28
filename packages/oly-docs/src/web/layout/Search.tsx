import { Popover, Position } from "@blueprintjs/core";
import { action, attach, Go, styles } from "oly-react";
import * as React from "react";
import { ChangeEvent } from "react";
import { IDoc } from "../../cli/interfaces";

export interface IResult {
  name: string;
  href: string;
  module: string;
}

export interface IState {
  query: string;
  results: IResult[] | null;
}

@attach
@styles(() => require("./Search.scss"))
export class Search extends React.Component<{ doc: IDoc }, IState> {

  public state: IState = {query: "", results: null};

  @action
  public handlePopoverInteraction(nextOpenState: boolean) {
    if (!nextOpenState) {
      this.resetState();
    }
  }

  @action
  public resetState() {
    this.setState({query: "", results: null});
  }

  @action
  public handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    if (!query) {
      this.setState({query: "", results: null});
      return;
    }
    const results: any[] = [];
    const queryCleaned = query.trim().toUpperCase();
    const push = (result: IResult) => {
      if (!results.filter((r) => r.href === result.href)[0]) {
        results.push(result);
      }
      const end = results.length > 4;
      if (end) {
        this.setState({query, results});
        return true;
      }
      return false;
    };
    for (const m of this.props.doc.modules) {
      for (const d of m.decorators) {
        const dId = d.name.toUpperCase();
        const dId2 = "@" + dId;
        if (dId.indexOf(queryCleaned) > -1) {
          if (push({
              href: "/m/" + m.name + "/@/" + d.name,
              module: m.name,
              name: "@" + d.name,
            })) {
            return;
          }
        } else if (dId2.indexOf(queryCleaned) > -1) {
          if (push({
              href: "/m/" + m.name + "/@/" + d.name,
              module: m.name,
              name: "@" + d.name,
            })) {
            return;
          }
        }
      }
      for (const ev of m.env) {
        const dEv = ev.name.toUpperCase();
        if (dEv.indexOf(queryCleaned) > -1) {
          if (push({
              href: "/m/" + m.name + "/",
              module: m.name,
              name: ev.name.replace(/"/gmi, ""),
            })) {
            return;
          }
        }
      }
      for (const s of m.services) {
        const sId = s.name.toUpperCase();
        if (sId.indexOf(queryCleaned) > -1) {
          if (push({
              href: "/m/" + m.name + "/s/" + s.name,
              module: m.name,
              name: s.name,
            })) {
            return;
          }
        }
        for (const me of s.methods) {
          const meId = me.name.toUpperCase();
          const ultraQueryCleaned = queryCleaned.replace(sId, "").replace(/[#.]/, "");
          if (meId.indexOf(ultraQueryCleaned) > -1) {
            if (push({
                href: "/m/" + m.name + "/s/" + s.name + "/" + me.name,
                module: m.name,
                name: s.name + "#" + me.name + "()",
              })) {
              return;
            }
          }
        }
      }
    }
    this.setState({query, results});
  }

  public render() {
    return (
      <div className="search">
        <Popover
          content={(
            <div>
              {Array.isArray(this.state.results) && this.state.results.length > 0
                ? this.state.results.map((result: any) => (
                  <div key={result.href} className="search-item">
                    <Go onClick={this.resetState} to={result.href}>
                      <small className="pt-tag pt-round">{result.module.replace("oly-", "")}</small>
                      <span>{result.name}</span>
                    </Go>
                  </div>))
                : <div className="search-empty">👌 No result for "{this.state.query}".</div>}
            </div>
          )}
          onInteraction={this.handlePopoverInteraction}
          autoFocus={false}
          enforceFocus={false}
          isOpen={!!this.state.results}
          inline={false}
          popoverClassName="pt-popover-content-sizing pt-minimal search"
          position={Position.BOTTOM}
        >
          <div className="pt-input-group" style={{marginRight: "20px"}}>
            <span className="pt-icon pt-icon-search"/>
            <input
              maxLength={30}
              style={{width: "235px"}}
              type="search"
              placeholder="Search..."
              onChange={this.handleSearchChange}
              value={this.state.query}
              className="pt-input"
            />
          </div>
        </Popover>
      </div>
    );
  }
}
