import { CronJob } from "cron";
import { Class, env, IDeclarations, inject, IProvider, Kernel, Logger, Meta, state } from "oly-core";
import { olyCronKeys } from "./constants/keys";
import { IScheduler, ISchedulersMetadata } from "./interfaces";

/**
 *
 */
export class CronProvider implements IProvider {

  @env("OLY_CRON_TIMEZONE")
  public timezone: string = "";

  @state
  public jobs: CronJob[];

  @inject
  protected logger: Logger;

  @inject
  protected kernel: Kernel;

  /**
   *
   * @param declarations
   */
  public scan(declarations: IDeclarations) {
    this.jobs = [];
    for (const {definition: target} of declarations) {
      const schedulersMetadata = Meta.of({key: olyCronKeys.schedulers, target}).get<ISchedulersMetadata>();
      if (schedulersMetadata) {

        const keys = Object.keys(schedulersMetadata.properties);
        for (const propertyKey of keys) {
          const scheduler = schedulersMetadata.properties[propertyKey];
          this.schedule(target, propertyKey, scheduler);
        }
      }
    }
  }

  /**
   *
   * @param target
   * @param propertyKey
   * @param scheduler
   */
  public schedule(target: Class, propertyKey: string, scheduler: IScheduler) {

    this.logger.debug(`schedule ${target.name}.${propertyKey}`);
    this.jobs.push(new CronJob({
      cronTime: scheduler.cron,
      onTick: async () => {
        const child = this.kernel.fork();
        const logger = child.get(Logger).as("Scheduler");
        try {
          logger.debug("start scheduled job");
          await child.get(target)[propertyKey]();
          logger.info("end scheduled job");
        } catch (e) {
          logger.warn("job has failed", e);
        }
      },
      timeZone: this.timezone,
    }));
  }

  public onStart(declarations: IDeclarations) {
    this.scan(declarations);
    this.jobs.forEach((job) => job.start());
  }

  /**
   *
   */
  public onStop() {
    this.jobs.forEach((job) => job.stop());
  }
}
