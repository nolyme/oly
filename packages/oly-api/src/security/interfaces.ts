/**
 *
 */
export interface IToken {
  id: string;
  roles: string[];
}

/**
 * Default payload structure.
 */
export interface IPayload {
  data: IToken;
  exp: number;
  iat: number;
}
