/**
 * Opinionated token data structure.
 */
export interface IToken {

  /**
   * Define an unique identifier.
   */
  id: string;

  /**
   * Define a realm/domain.
   */
  domain?: string;

  /**
   * Define zero-to-many roles/relations/grants.
   */
  roles?: string[];
}

/**
 * Default payload structure.
 */
export interface IPayload {

  /**
   * Custom data.
   */
  data: IToken;

  /**
   * Expiration time.
   */
  exp: number;

  /**
   * Issued at.
   */
  iat: number;
}
