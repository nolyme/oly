import { Global, inject, Logger } from "oly";
import { PixieHttp } from "./PixieHttp";
import { PixieSession } from "./PixieSession";
import { PixieStore } from "./PixieStore";

export class Pixie {

  @inject
  public readonly store: PixieStore;

  @inject
  public readonly http: PixieHttp;

  @inject
  public readonly session: PixieSession;

  @inject
  protected logger: Logger;

  public init(store?: object) {

    if (!!store) {
      this.logger.debug("feed pixie with", store);
      this.store["data"] = store;
    }

    Global.noop(this.http.root);
    Global.noop(this.session.getIdentity());
    Global.noop(this.session.get("noop"));
  }
}
