import { Class } from "oly";

export interface ITaskProperty {
  name: string;
  delay: number;
  unique: boolean;
  concurrency: number;
  retry: number | undefined;
  backoff: boolean | { type: string; delay?: number } | undefined;
  ttl: number | undefined;
  priority: "low" | "normal" | "medium" | "high" | "critical";
  volatile: boolean | undefined;
}

export interface ITask {
  propertyKey: string;
  target: Class;
  options: ITaskProperty;
}

export type ITaskStatus = "inactive" | "active" | "failed" | "complete";
