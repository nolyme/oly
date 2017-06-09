import { Popover, Position } from "@blueprintjs/core";
import { inject } from "oly-core";
import { action, attach, Go, styles } from "oly-react";
import * as React from "react";
import { ChangeEvent } from "react";
import { IDocs } from "../../cli/interfaces";
import { ISearchItem, ModuleService } from "../ModuleService";

export interface IState {
  query: string;
  results: ISearchItem[] | null;
}

@attach
@styles(() => require("./Search.scss"))
export class Search extends React.Component<{ docs: IDocs }, IState> {

  public state: IState = {query: "", results: null};

  @inject private ms: ModuleService;

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
    const results = this.ms.search(query);
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
