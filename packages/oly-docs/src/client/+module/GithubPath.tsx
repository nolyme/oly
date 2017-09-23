import * as React from "react";

export const GithubPath = (props: { module: string, path: string }) =>
  <h2 className="subtitle links">
    <a
      style={{marginTop: "-20px"}}
      target="_blank"
      href={`https://github.com/nolyme/oly/blob/master/packages/${props.module}/src${props.path}`}>
      {props.path}
    </a>
  </h2>;
