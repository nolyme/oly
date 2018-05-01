import { Global } from "oly";
import { JsonWebTokenException } from "../exceptions/JsonWebTokenException";
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
  public static payload(token: string): IPayload {

    if (!this.cache[token]) {
      try {
        this.cache[token] = JSON.parse(Global.decodeBase64(token.split(".")[1]));
      } catch (e) {
        throw new JsonWebTokenException(e, "Invalid token");
      }
    }

    return this.cache[token];
  }

  /**
   * Get the ttl in second.
   *
   * @param token       Json Web IToken
   * @return            Ttl
   */
  public static lifeTime(token: string): number {
    const payload = Jwt.payload(token);
    return Number(payload.exp) - Number(payload.iat);
  }

  /**
   * Get expiry date.
   *
   * @param token       Json Web IToken
   * @return            Ttl
   */
  public static expiryDate(token: string): Date {
    const ttl = this.lifeTime(token);
    return new Date(Date.now() + ttl * 1000);
  }

  /**
   * Check if token is valid + payload.data.roles includes <ROLES>
   * @param {string} token
   * @param {string} role
   * @returns {boolean}
   */
  public static hasRole(token: string, role: string): boolean {

    if (!token) {
      return false;
    }

    try {
      const payload = Jwt.payload(token);

      if (payload.exp <= (Date.now() / 1000)) {
        return false;
      }

      if (!payload.data.roles) {
        return false;
      }

      return payload.data.roles.indexOf(role) > -1;
    } catch (e) {
      return false;
    }
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

    try {
      const payload = Jwt.payload(token);
      return payload.exp > (Date.now() / 1000);
    } catch (e) {
      return false;
    }
  }

  private static cache: { [key: string]: IPayload } = {};
}
