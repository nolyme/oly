import { Options } from "amqplib";
import { IClass } from "oly-core";

export interface ITaskOptions {
  assert: Options.AssertQueue;
  consume: Options.Consume;
  name: string;
  priority: number;
  retry: number;
  concurrency: number;
}

export interface ITask {
  target: IClass;
  propertyKey: string;
  options: ITaskOptions;
}

export interface ITasks {
  [propertyKey: string]: ITask;
}

export interface ITaskData {
  // the kernel id who send the message
  id: string;
  // default to 0, +1 if fail
  attempts: number;
  // user data
  payload: any;
}
