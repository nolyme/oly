/**
 *
 */

export type Side = "browser" | "server" | "both";

/**
 *
 */
export interface IPixieSetOptions {
  only?: Side;
  once?: boolean;
}
