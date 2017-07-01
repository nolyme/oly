import { get } from "oly-api";

export class RootApi {

  @get("/")
  public index() {
    return {ok: true};
  }
}
