import { Message, Options } from "amqplib";
import { IMetadata } from "oly-core";

export type IMessage = Message;

export interface ITasksMetadata extends IMetadata {
  properties: {
    [key: string]: {
      assert: Options.AssertQueue;
      consume: Options.Consume;
      name: string;
    };
  };
}
