import { CronJob } from "cron";
import { env, Function, IDeclarations, inject, Kernel, Logger, MetadataUtil as m, state } from "oly-core";
import { lySchedulers } from "./constants";
import { ISchedulerMetadata, ISchedulerMetadataMap } from "./interfaces";

/**
 *
 */
export class CronProvider {

  @env("OLY_CRON_TIMEZONE")
  public timezone: string = "";

  @state()
  public jobs: CronJob[];

  @inject(Logger)
  protected logger: Logger;

  @inject(Kernel)
  protected kernel: Kernel;

  /**
   *
   * @param deps
   */
  protected onConfigure(deps: IDeclarations) {
    this.jobs = [];
    return deps
      .filter((dep) => m.has(lySchedulers, dep.definition))
      .map((dep) => ({schedulers: m.deep(lySchedulers, dep.definition) as ISchedulerMetadataMap, dep}))
      .map(({schedulers, dep}) => Object.keys(schedulers).map((key) => ({key, value: schedulers[key], dep})))
      .reduce((array, deps2) => array.concat(deps2), [])
      .forEach(({key, value, dep: {definition}}) => this.schedule(definition, key, value));
  }

  protected onStart() {
    this.jobs.forEach((job) => job.start());
  }

  /**
   *
   */
  protected onStop() {
    this.jobs.forEach((job) => job.stop());
  }

  /**
   *
   * @param definition
   * @param propertyKey
   * @param scheduler
   */
  private schedule(definition: Function, propertyKey: string, scheduler: ISchedulerMetadata) {

    this.logger.debug(`schedule ${definition.name}.${propertyKey}`);
    this.jobs.push(new CronJob({
      cronTime: scheduler,
      onTick: async () => {
        const child = this.kernel.fork();
        const logger = child.get(Logger).as("Scheduler");
        try {
          logger.debug("start scheduled job");
          await child.get(definition)[propertyKey]();
          logger.info("end scheduled job");
        } catch (e) {
          logger.warn("job has failed", e);
        }
      },
      timeZone: this.timezone,
    }));
  }
}
