/**
 *
 */
declare module "oly-core/lib/env" {
  interface IEnv {
    /**
     *
     */
    OLY_SECURITY_SECRET?: string;
    /**
     *
     */
    OLY_SECURITY_SALT_ROUND?: number | string;
    /**
     *
     */
    OLY_SECURITY_ALGO?: string;
    /**
     *
     */
    OLY_SECURITY_TOKEN_EXPIRATION?: number | string;
  }
}

export * from "./index.browser";
export * from "./interfaces";
export * from "./decorators/auth";
export * from "./middlewares/parseToken";
export * from "./middlewares/isAuth";
export * from "./middlewares/hasRole";
export * from "./services/JwtAuthService";
export * from "./services/CryptoService";
