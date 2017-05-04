/**
 *
 */
export interface IEnv {

  /**
   * Set a name to your app.
   */
  OLY_APP_NAME?: string;

  /**
   * Set the level of your logger.
   */
  OLY_LOGGER_LEVEL?: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";
}
