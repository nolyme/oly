import { Global, IDecorator, Kernel, Meta } from "oly";
import * as PropTypes from "prop-types";
import * as React from "react";
import { ComponentInjector } from "../services/ComponentInjector";

export type InjectableComponent = React.Component<{}, {}> & { injected$$: boolean, context: { kernel: Kernel } };

export interface IAttachOptions {
  watch?: string[]; // events
  styles?: any;
}

export class AttachDecorator implements IDecorator {

  public constructor(private options: IAttachOptions = {}) {
  }

  public asClass(target: { contextTypes?: any; prototype?: any }): void {
    const self = this;

    if (target.contextTypes) {
      target.contextTypes.kernel = PropTypes.object;
    } else {
      target.contextTypes = {kernel: PropTypes.object};
    }

    // patch react component hooks (stateful only)
    if (!!target.prototype) {

      if (!!target.prototype.componentWillMount$$) {
        target.prototype.componentWillMount = target.prototype.componentWillMount$$;
        target.prototype.componentWillUnmount = target.prototype.componentWillUnmount$$;
      }

      // force Kernel#inject() before #componentWillMount()
      target.prototype.componentWillMount$$ = target.prototype.componentWillMount || Global.noop;
      target.prototype.componentWillMount = function componentWillMount(this: InjectableComponent) {
        if (!this.injected$$ && this.context.kernel) { // you can call #componentWillMount more than once now
          this.context.kernel.inject(ComponentInjector).inject(target, this, self.options);
          this.injected$$ = true;
        }
        return target.prototype.componentWillMount$$.apply(this, arguments);
      };

      // try to clean event-listeners before componentWillUnmount
      target.prototype.componentWillUnmount$$ = target.prototype.componentWillUnmount || Global.noop;
      target.prototype.componentWillUnmount = function componentWillUnmount(this: InjectableComponent) {
        if (this.context.kernel) {
          this.context.kernel.inject(ComponentInjector).free(this);
        }
        return target.prototype.componentWillUnmount$$.apply(this, arguments);
      };
    }
  }
}

/**
 * Connect a component to an oly Kernel of the React context.
 *
 * > Since 0.13, it's not required.
 *
 * This decorator adds some features:
 *
 * Before `componentWillMount`, kernel will process the component:
 * - process @inject
 * - process @state/@env
 * - process @on
 *
 * Before `componentWillUnmount`, kernel will `__free__` all events of the component.
 *
 * ```ts
 * &shy;@attach
 * class Home extends Component<any, any> {
 *   @inject a: B; // this is allowed
 *
 *   render() { }
 * }
 * ```
 *
 * > Use @attach only if you really need a connection between oly and react.
 *
 * ### Watchers
 *
 * Component#forceUpdate() is called after each oly state mutation if component relies on the state.
 *
 * ```ts
 * class MyProvider { @state("SUPER_STATE") myState: string }
 * class MyService { @inject p: MyProvider }
 *
 * class MyComponent extends React.Component {
 *   @inject s: MyService; // component will use #forceUpdate on each "SUPER_STATE" mutation.
 * }
 * ```
 *
 * use @attach({watch: [ ...list of oly-stateNames ]} to override the watch list.
 */
export const attach = Meta.decorator<IAttachOptions>(AttachDecorator);
