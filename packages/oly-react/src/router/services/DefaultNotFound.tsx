import * as React from "react";
import { page404 } from "../decorators/page404";

export class DefaultNotFound {

  @page404
  public page404(): JSX.Element {
    return <div>Page Not Found</div>;
  }
}
