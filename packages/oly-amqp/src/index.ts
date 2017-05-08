/**
 *
 */
declare module "oly-core/lib/env" {
  interface IEnv {
    /**
     *
     */
    OLY_QUEUE_URL?: string;
    /**
     *
     */
    OLY_QUEUE_RETRY_DELAY?: number | string;
    /**
     *
     */
    OLY_QUEUE_CONCURRENCY?: number;
  }
}

export * from "./constants";
export * from "./interfaces";
export * from "./decorators/task";
export * from "./providers/WorkerProvider";
export * from "./providers/AmqpProvider";
