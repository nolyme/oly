import { inject } from "oly";
import { action, Go, Router } from "oly-react";
import * as React from "react";
import { ChangeEvent, KeyboardEvent, MouseEvent, SyntheticEvent } from "react";
import { Docs, ISearchItem } from "../services/Docs";

export interface IState {
  query: string;
  results: ISearchItem[] | null;
  focus: number;
}

export class Search extends React.Component<{}, IState> {

  public state: IState = {
    query: "",
    results: null,
    focus: -1,
  };

  @inject private ms: Docs;
  @inject private router: Router;

  @action
  public handlePopoverInteraction(nextOpenState: boolean) {
    if (!nextOpenState) {
      this.resetState();
    }
  }

  @action
  public resetState() {
    this.setState({query: "", results: null, focus: -1});
  }

  @action
  public handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    if (!query) {
      this.setState({query: "", results: null});
      return;
    }
    const results = this.ms.search(query);
    if (results.length > 0) {
      this.setState({query, results, focus: 0});
    } else {
      this.setState({query, results});
    }
  }

  @action
  public onSubmit(ev: SyntheticEvent<any>) {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.state.results) {
      this.setState({query: "", results: null, focus: -1});
      this.router.go(this.state.results[this.state.focus].href);
    }
  }

  @action
  public onKeyDown(ev: KeyboardEvent<any>) {
    if (!this.state.results) {
      return;
    }
    if (ev.keyCode === 40) {
      if (this.state.focus < this.state.results.length) {
        this.setState({
          focus: this.state.focus += 1,
        });
      }
    } else if (ev.keyCode === 38) {
      if (this.state.focus > 0) {
        this.setState({
          focus: this.state.focus -= 1,
        });
      } else if (this.state.focus === 0) {
        this.setState({
          focus: -1,
        });
      }
    }
  }

  public onMouseOver(index: number) {
    return (ev: MouseEvent<HTMLAnchorElement>) => {
      this.setState({
        focus: index,
      });
    };
  }

  public render() {
    return (
      <div
        className="search"
        onKeyDown={this.onKeyDown}
      >
        <form onSubmit={this.onSubmit}>
          <input
            style={{width: "300px"}}
            className="input"
            type="search"
            placeholder="Search..."
            onChange={this.handleSearchChange}
            value={this.state.query}
          />
        </form>
        {!!this.state.results && <div className="search-popover">
          {Array.isArray(this.state.results) && this.state.results.length > 0
            ? this.state.results.map((result: any, index) => (
              <div
                key={result.href}
                className="search-item"
                onKeyDown={this.onKeyDown}
              >
                <Go
                  onClick={this.resetState}
                  to={result.href}
                  onMouseOver={this.onMouseOver(index)}
                  className={this.state.focus === index ? "focus" : ""}
                >
                  <span className="search-tag">{result.module.replace("oly-", "")}</span>
                  <span>{result.name}</span>
                </Go>
              </div>))
            : <div className="search-empty">👌 No result for "{this.state.query}".</div>}
        </div>}
      </div>
    );
  }
}
