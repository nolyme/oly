import * as bcrypt from "bcryptjs";
import { createCipher, createDecipher } from "crypto";
import { env } from "oly";

/**
 * Bcrypt and Node cypher.
 */
export class Crypto {

  /**
   * App secret key.
   */
  @env("SECURITY_SECRET")
  public readonly secret: string = "insert a secret key here";

  /**
   * Bcrypt salt round.
   */
  @env("SECURITY_SALT_ROUND")
  public readonly saltRound: number | string = 8;

  /**
   * Decipher algorithm.
   */
  @env("SECURITY_ALGO")
  public readonly algorithm: string = "aes-256-ctr";

  /**
   * Compare a string with a hash.
   *
   * ```ts
   * class AuthCtrl {
   *   @inject userRepository: UserRepository;
   *   @inject crypto: Crypto;
   *
   *   @post("/")
   *   async login(@body data: LoginBody) {
   *
   *     const user = this.userRepository.findByEmail(data.email);
   *     if (!user) throw new UnauthorizedException();
   *
   *     const match = await crypto.compare(data.password, user.password);
   *     if (!match) throw new UnauthorizedException();
   *
   *     // ...
   *   }
   * }
   *
   * ```
   *
   * @param entry   Raw string
   * @param hash    Hash
   */
  public compare(entry: string, hash: string): Promise<boolean> {
    return bcrypt.compare(entry, hash);
  }

  /**
   * Generate salt used by bcrypt.
   *
   * @return      Salt as string when process is done.
   */
  public salt(): Promise<string> {
    return bcrypt.genSalt(Number(this.saltRound));
  }

  /**
   * Hash a string with bcrypt.
   *
   * ```ts
   * const crypto = k.get(Crypto);
   * const hash = await crypto.hash("password");
   * ```
   *
   * @param data
   * @param salt
   * @return {Promise<string>}
   */
  public async hash(data: string, salt?: string): Promise<string> {
    return await bcrypt.hash(data, salt || await this.salt());
  }

  /**
   * Encrypt string data to hex with algo and secret.
   *
   * @param text        Data to encrypt
   * @param base64      If true, output will be base64
   * @return {string}
   */
  public encrypt(text: string, base64: boolean = false): string {
    const cipher = createCipher(this.algorithm, this.secret);
    let crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");

    if (base64) {
      return Buffer.from(crypted, "hex").toString("base64");
    }

    return crypted;
  }

  /**
   * Decrypt a string with algo and secret.
   *
   * @param text        Data to decrypt
   * @param base64      if true, input will be parse as base64
   * @return {string}
   */
  public decrypt(text: string, base64: boolean = false): string {

    if (base64) {
      text = Buffer.from(text, "base64").toString("hex");
    }

    const decipher = createDecipher(this.algorithm, this.secret);
    let dec = decipher.update(text, "hex", "utf8");
    dec += decipher.final("utf8");

    return dec;
  }
}
