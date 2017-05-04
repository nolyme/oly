/**
 *
 */
declare module "oly-core/lib/env" {
  interface IEnv {
    /**
     * Set the cron timezone.
     */
    OLY_CRON_TIMEZONE?: string;
  }
}

export * from "./interfaces";
export * from "./annotations";
export * from "./CronProvider";
