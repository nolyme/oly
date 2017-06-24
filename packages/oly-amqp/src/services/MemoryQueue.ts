import { Channel, Message, Options, Replies } from "amqplib";
import * as Bluebird from "bluebird";
import { EventEmitter } from "events";
import { IMemoryWorker } from "../interfaces";

/**
 * It's a joke ...
 */
export class MemoryQueue extends EventEmitter implements Channel {

  static queues: {
    [queue: string]: IMemoryWorker,
  } = {};

  async close(): Bluebird<void> {
    return undefined;
  }

  async assertQueue(queue: string, options?: Options.AssertQueue): Bluebird<Replies.AssertQueue> {
    return {
      queue,
      messageCount: 0,
      consumerCount: 0,
    };
  }

  async checkQueue(queue: string): Bluebird<Replies.AssertQueue> {
    return {
      queue,
      messageCount: 0,
      consumerCount: 0,
    };
  }

  async deleteQueue(queue: string, options?: Options.DeleteQueue): Bluebird<Replies.DeleteQueue> {
    delete MemoryQueue.queues[queue];
    return {
      messageCount: 0,
    };
  }

  async purgeQueue(queue: string): Bluebird<Replies.PurgeQueue> {
    MemoryQueue.queues[queue].tasks = [];
    return {
      messageCount: 0,
    };
  }

  async bindQueue(queue: string, source: string, pattern: string, args?: any): Bluebird<Replies.Empty> {
    return {};
  }

  async unbindQueue(queue: string, source: string, pattern: string, args?: any): Bluebird<Replies.Empty> {
    return {};
  }

  async assertExchange(exchange: string,
                       type: string,
                       options?: Options.AssertExchange): Bluebird<Replies.AssertExchange> {
    return {
      exchange: "",
    };
  }

  async checkExchange(exchange: string): Bluebird<Replies.Empty> {
    return {};
  }

  async deleteExchange(exchange: string, options?: Options.DeleteExchange): Bluebird<Replies.Empty> {
    return {};
  }

  async bindExchange(destination: string, source: string, pattern: string, args?: any): Bluebird<Replies.Empty> {
    return {};
  }

  async unbindExchange(destination: string, source: string, pattern: string, args?: any): Bluebird<Replies.Empty> {
    return {};
  }

  publish(exchange: string, routingKey: string, content: Buffer, options?: Options.Publish): boolean {
    return true;
  }

  sendToQueue(queue: string, content: Buffer, options?: Options.Publish): boolean {
    if (MemoryQueue.queues[queue]) {
      const message = {fields: {}, properties: options, content};
      MemoryQueue.queues[queue].tasks.push(message);
      this.next(queue);
    }
    return true;
  }

  async consume(queue: string,
                onMessage: (msg: Message) => any,
                options?: Options.Consume): Bluebird<Replies.Consume> {
    MemoryQueue.queues[queue] = {
      executor: onMessage,
      tasks: [],
    };
    return {
      consumerTag: "",
    };
  }

  async cancel(consumerTag: string): Bluebird<Replies.Empty> {
    return {};
  }

  async get(queue: string, options?: Options.Get): Bluebird<Message | any> {
    return undefined;
  }

  ack(message: Message, allUpTo?: boolean): void {
    for (const q of Object.keys(MemoryQueue.queues)) {
      const i = MemoryQueue.queues[q].tasks.indexOf(message);
      if (i) {
        MemoryQueue.queues[q].tasks.slice(i, 1);
        this.next(q);
      }
    }
  }

  ackAll(): void {
    //
  }

  nack(message: Message, allUpTo?: boolean, requeue?: boolean): void {
    //
  }

  nackAll(requeue?: boolean): void {
    //
  }

  reject(message: Message, requeue?: boolean): void {
    //
  }

  async prefetch(count: number, global?: boolean): Bluebird<Replies.Empty> {
    return {};
  }

  async recover(): Bluebird<Replies.Empty> {
    return {};
  }

  private next(queue: string) {
    if (MemoryQueue.queues[queue].tasks.length > 0) {
      process.nextTick(() => {
        MemoryQueue.queues[queue].executor(MemoryQueue.queues[queue].tasks[0]);
      });
    }
  }
}
