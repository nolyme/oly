import { get } from "oly-api";

export class RootController {

  @get("/")
  public index() {
    return {ok: true};
  }
}
