import { _, inject } from "oly-core";
import { ReactServerProvider } from "../../router/providers/ReactServerProvider";
import { ReactServerRenderer } from "../../router/services/ReactServerRenderer";
import { Pixie } from "../services/Pixie";
import { PixieHttp } from "../services/PixieHttp";
import { PixieSession } from "../services/PixieSession";

export class PixieServerProvider {

  @inject(ReactServerProvider)
  protected readonly reactServerProvider: ReactServerProvider;

  @inject(ReactServerRenderer)
  protected readonly reactServerRenderer: ReactServerRenderer;

  /**
   * Hook - start
   */
  protected onStart() {

    // /!\ this is a token handler for pixie-session in server side, SERVER SIDE
    this.reactServerProvider.use((ctx, next) => {

      // you get it ? this is a CHILD context, not the GLOBAL CONTEXT
      // you can do everything you want in this context
      const kernelOfThisRequestOnly = ctx.kernel;

      // get a the pixie and the session of this request
      const pixie = kernelOfThisRequestOnly.get(Pixie);
      const session = kernelOfThisRequestOnly.get(PixieSession);
      const http = kernelOfThisRequestOnly.get(PixieHttp);

      // force pixie http root here
      // this will write API_ROOT into pixie_data
      // - yes, this is shitty
      _.noop(http.root);

      // then, if a cookieName "token" is present, we put it into the pixie and in memory
      const token = ctx.cookies.get(session.cookieName);
      if (!!token) {
        // feed the REACT SERVER session
        session.setToken(token);
        // feed the REACT CLIENT session
        pixie.set(session.cookieName, token);
      }

      return next();
    });

    // set pixie store into index.html
    this.reactServerRenderer.templateTransforms.push(((template, context) =>
        template.replace(/<body(.*)>/, `<body$1>${context.get(Pixie).toHTML()}`)
    ));
  }
}
