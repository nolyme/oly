import * as Bull from "bull";
import { Class, IMetadata } from "oly";

export interface ITaskMetadata extends IMetadata {
  properties: { [key: string]: ITaskProperty };
}

export interface ITaskProperty extends Bull.JobOptions {
  name: string;
  concurrency: number;
  unique: boolean;
}

export interface ITask {
  queue: Bull.Queue;
  propertyKey: string;
  target: Class;
  options: ITaskProperty;
}

export interface IJob extends Bull.Job {
}

export interface IQueue extends Bull.Queue {
}

export type ITaskStatus = "inactive" | "active" | "failed" | "complete";
