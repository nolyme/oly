import { attach } from "oly-react";
import * as React from "react";

@attach
export class NotFound extends React.Component<{}, {}> {

  public render() {
    return (
      <div className="pt-card">
        <div className="pt-non-ideal-state">
          <div className="pt-non-ideal-state-visual pt-non-ideal-state-icon">
            <span className="pt-icon pt-icon-folder-open"/>
          </div>
          <h4 className="pt-non-ideal-state-title">This folder is empty</h4>
          <div className="pt-non-ideal-state-description">
            Create a new file to populate the folder.
          </div>
        </div>
      </div>
    );
  }
}
