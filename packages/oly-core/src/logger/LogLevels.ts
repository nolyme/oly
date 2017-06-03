/**
 * Not very configurable log levels
 */
export enum LogLevels {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  NONE,
}

export type ILogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "NONE";
