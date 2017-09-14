export interface ITimer {

  /**
   * Js Timer identifier (NodeJs or Browser)
   */
  id: any;

  /**
   * Timeout or Interval
   */
  type: "timeout" | "interval";

  /**
   * Function to call
   */
  tick: Function;

  /**
   * Start time
   */
  now: number;

  /**
   * Duration in millis
   */
  ms: number;
}

/**
 * Idea:
 *
 * Do not rely on Date.now and setTimeout on your app.
 * If this is class is used EVERYWHERE is the app, it will be fun.
 */
export class Time {

  public static setTimeout = setTimeout;
  public static now = Date.now;

  /**
   * Time cursor.
   */
  private cursor: number | null;

  /**
   * Timer registry.
   */
  private timers: any[] = [];

  /**
   * Patch global setTimeout and Date.now
   */
  public global(): this {
    const g: any = (typeof window === "undefined" ? global : window);
    g.Date.now = this.now.bind(this);
    g.setTimeout = this.timeout.bind(this);
    return this;
  }

  /**
   * Date.now like
   */
  public now(): number {
    return this.cursor || Time.now();
  }

  /**
   * setTimeout like
   *
   * @param func
   * @param ms
   */
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
      timer.id = Time.setTimeout(() => {
        if (!this.cursor) {
          func();
          this.timers.splice(this.timers.indexOf(timer), 1);
        }
      }, ms);
    }

    return timer;
  }

  /**
   * Pause fake time.
   */
  public pause(): number {
    this.cursor = Time.now();
    return this.cursor;
  }

  /**
   * Resume fake time.
   */
  public reset(): void {
    this.cursor = null;
  }

  /**
   * Move cursor if time is paused.
   *
   * @param ms    Positive or negative delta in millis
   */
  public travel(ms: number): void {
    if (this.cursor) {
      this.cursor += ms;
      for (const timer of this.timers) {
        if (timer.now + timer.ms <= this.cursor) {
          timer.tick();
          this.timers.splice(this.timers.indexOf(timer), 1);
        }
      }
    }
  }
}
