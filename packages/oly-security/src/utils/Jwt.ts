import { Global } from "oly";
import { IPayload } from "../interfaces";

/**
 * Collection of one line util about Jwt.
 */
export class Jwt {

  /**
   * Extract payload from token.
   *
   * @param token     Json Web IToken
   * @return          IPayload
   */
  public static parse(token: string): IPayload {
    return JSON.parse(Global.atob(token.split(".")[1]));
  }

  /**
   * Get the ttl in second.
   *
   * @param token       Json Web IToken
   * @return            Ttl
   */
  public static getLifeTime(token: string): number {
    const payload = Jwt.parse(token);
    return Number(payload.exp) - Number(payload.iat);
  }

  /**
   * Check if token is defined and not expired.
   *
   * @param token       Json Web IToken
   * @return            True if everything is ok
   */
  public static isValid(token: string | null | undefined): boolean {
    if (!token) {
      return false;
    }
    const payload = Jwt.parse(token);
    return payload.exp > (new Date().getTime() / 1000);
  }
}
