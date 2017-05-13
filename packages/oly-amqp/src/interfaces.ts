import { Message, Options } from "amqplib";
import { IClass } from "oly-core";

export type IMessage = Message;

export interface ITaskOptions {
  assert: Options.AssertQueue;
  consume: Options.Consume;
  name: string;
}

export interface ITask {
  target: IClass;
  propertyKey: string;
  options: ITaskOptions;
}

export interface ITasks {
  [propertyKey: string]: ITask;
}
