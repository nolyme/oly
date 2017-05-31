import { Message, Options } from "amqplib";
import { IMetadata } from "oly-core";

export type IMessage = Message;

export interface ITaskProperty {
  assert: Options.AssertQueue;
  consume: Options.Consume;
  name: string;
}

export interface ITasksMetadata extends IMetadata {
  properties: {
    [key: string]: ITaskProperty;
  };
}
