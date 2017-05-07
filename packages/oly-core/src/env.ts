export interface IEnv {

  /**
   * Set a name to your app.
   *
   * @default "MyApp"
   */
  OLY_APP_NAME?: string;

  /**
   * Set the level of your logger.
   *
   * @default "INFO"
   */
  OLY_LOGGER_LEVEL?: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";
}
