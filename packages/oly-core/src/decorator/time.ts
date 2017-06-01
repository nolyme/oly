import { Logger } from "../logger/Logger";
import { AspectDecorator } from "./AspectDecorator";
import { IAspectParameter } from "./interfaces";
import { Meta } from "./Meta";

export class TimeDecorator extends AspectDecorator {
  public asProxy(ctx: IAspectParameter) {
    if (ctx.kernel) {
      const l = ctx.kernel.get(Logger).as(ctx.target.name);
      l.info(`Begin #${ctx.propertyKey}()`);
      const before = Date.now();
      ctx.call();
      const after = Date.now() - before;
      l.info(`End #${ctx.propertyKey}() (${after}ms)`);
    }
  }
}

export const time = Meta.decorator(TimeDecorator);
