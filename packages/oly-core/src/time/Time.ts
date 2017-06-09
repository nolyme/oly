export interface ITimer {
  id: any;
  type: "timeout" | "interval";
  tick: Function;
  now: number;
  ms: number;
}

export class Time {

  cursor: number | null;

  timers: any[] = [];

  public now(): number {
    return this.cursor || Date.now();
  }

  public timeout(func: Function, ms: number = 0): ITimer {

    const timer: ITimer = {
      id: null,
      tick: func,
      ms,
      now: this.now(),
      type: "timeout",
    };

    this.timers.push(timer);

    if (!this.cursor) {
      timer.id = setTimeout(() => {
        if (!this.cursor) {
          func();
        }
      }, ms);
    }

    return timer;
  }

  public pause(): void {
    this.cursor = Date.now();
  }

  public reset(): void {
    this.cursor = null;
  }

  public travel(ms: number): void {
    if (this.cursor) {
      this.cursor += ms;
      for (const timer of this.timers) {
        if (timer.now + timer.ms < this.cursor) {
          timer.tick();
        }
      }
    }
  }
}
