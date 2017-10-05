import { Job } from "kue";
import { Exception, inject, Kernel, Logger } from "oly";
import { olyQueueErrors } from "../constants/errors";
import { ITaskStatus } from "../interfaces";
import { QueueProvider } from "../providers/QueueProvider";

export class Publisher {

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  @inject
  protected queueProvider: QueueProvider;

  /**
   * Create a new task.
   *
   * @param taskName      name of the task
   * @param data          data (string, number, object, ...)
   */
  public async push(taskName: string, data: Object = {}): Promise<Job> {

    this.logger.trace(`push ${taskName}`, {data});

    // create job
    const task = this.queueProvider.tasks.find(({options}) => taskName === options.name);
    if (!task) {
      throw new Exception(olyQueueErrors.taskDoesNotExist(taskName));
    }

    if (task.options.unique) {
      const match = await this.getJobByData(taskName, data);
      if (match) {
        this.logger.trace("re-use unique task");
        return match;
      }
    }

    const job = this.queueProvider.queue.create(taskName, data);

    if (typeof task.options.ttl === "number") {
      job.ttl(task.options.ttl);
    }

    if (typeof task.options.retry === "number") {
      job
        .attempts(task.options.retry)
        .backoff(task.options.backoff || true);
    }

    job.delay(task.options.delay);
    job.priority(task.options.priority);
    job.removeOnComplete(task.options.volatile === false);

    return await new Promise<Job>((resolve, reject) => {
      job.save((err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve(job);
      });
    });
  }

  public async pushAndWait(taskName: string, data: any = {}): Promise<any> {
    return await this.wait(await this.push(taskName, data));
  }

  public wait(job: Job): Promise<any> {
    this.logger.trace(`wait job id=${job.id} ...`);
    return new Promise((resolve, reject) => {
      job.on("failed", (err: Error) => reject(err));
      job.on("complete", (data: any) => resolve(data));
    });
  }

  public getJobs(task?: string, status: ITaskStatus = "active"): Promise<Job[]> {

    if (!task) {
      return new Promise<Job[]>((resolve, reject) => {
        Job.range(0, -1, "asc", (err: Error, jobs: any) => {
          if (err) {
            return reject(err);
          }
          resolve(jobs);
        });
      });
    }

    return new Promise<Job[]>((resolve, reject) => {
      Job.rangeByType(task, status, 0, -1, "asc", (err: Error, result: any) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  public async getJobByData(task: string, data: any): Promise<Job | undefined> {

    const raw = JSON.stringify(data);
    const inactiveJobs = await this.getJobs(task, "inactive");
    for (const job of inactiveJobs) {
      if (JSON.stringify(job.data) === raw) {
        return job;
      }
    }

    const activeJobs = await this.getJobs(task, "active");
    for (const job of activeJobs) {
      if (JSON.stringify(job.data) === raw) {
        return job;
      }
    }
  }

  public removeJob(job: Job): Promise<void> {
    return new Promise((resolve, reject) => {
      job.remove((err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  public async purge(): Promise<void> {
    const jobs = await this.getJobs();
    await Promise.all(jobs.map((j) => this.removeJob(j)));
  }
}
