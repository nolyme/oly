import { inject } from "oly-core";
import { Helmet } from "react-helmet";
import { ReactServerProvider } from "../router/providers/ReactServerProvider";
import { ReactServerRenderer } from "../router/services/ReactServerRenderer";

/**
 *
 */
export class HelmetServerProvider {

  @inject(ReactServerRenderer)
  protected reactServerRenderer: ReactServerRenderer;

  @inject(ReactServerProvider)
  protected reactServerProvider: ReactServerProvider;

  /**
   * Hook - start
   */
  protected onStart() {
    this.reactServerRenderer.templateTransforms
      .push((template) => {
        const helmet = Helmet.renderStatic();
        // TODO: use cheerio
        return template
          .replace(
            /<html(.*?)>/,
            `<html $1 ${helmet.htmlAttributes.toString()}>`)
          .replace(
            /<title>.*<\/title>/,
            `${helmet.title.toString()}`)
          .replace(
            /<\/head>/,
            `${helmet.meta.toString()}${helmet.link.toString()}</head>`)
          .replace(
            /<body(.*?)>/,
            `<body $1 ${helmet.bodyAttributes.toString()}>`);
      });
  }
}
