import { env, inject, Logger, state } from "oly";
import { Cookies } from "./Cookies";

export class PixieSession {

  @env("PIXIE_SESSION_NAME")
  public readonly name: string = "PXI";

  @state
  private identifier: string | undefined;

  @inject
  private cookies: Cookies;

  @inject
  private logger: Logger;

  public get tk(): string | undefined {
    if (!this.identifier && !!this.cookies.get(this.name)) {
      this.identifier = this.cookies.get(this.name);
    } else if (!!this.identifier && !this.cookies.get(this.name)) {
      this.del();
    }
    return this.identifier;
  }

  public put(identifier: string, cookieOptions: any = {}) {
    this.logger.debug("use new pixie cookie");
    this.cookies.set(this.name, identifier, cookieOptions);
    this.identifier = identifier;
  }

  public del() {
    this.logger.debug("remove pixie cookie");
    this.cookies.set(this.name, undefined);
    this.identifier = undefined;
  }
}
