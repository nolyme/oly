import { MetadataUtil } from "oly-core";
import { lySchedulers } from "./constants";
import { ISchedulerMetadataMap } from "./interfaces";

/**
 * Set a cron to a method.
 * ```
 * class A {
 *  @cron("* * * * * *") loop() {}
 * }
 * ```
 * @param value   Cron value
 */
export const cron = (value: string) => (target: object, propertyKey: string) => {

  const schedulers: ISchedulerMetadataMap = MetadataUtil.get(lySchedulers, target.constructor);

  schedulers[propertyKey] = value;

  MetadataUtil.set(lySchedulers, schedulers, target.constructor);
};
