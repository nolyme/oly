import { Class, Global, inject, IStateMutateEvent, Kernel, Logger, Meta, olyCoreEvents, olyCoreKeys } from "oly-core";
import { Component } from "react";
import { olyReactEvents } from "../constants/events";
import { olyReactKeys } from "../constants/keys";
import { IAttachOptions } from "../decorators/attach";
import { IActionResult, IActionResultError, IActionsMetadata, IActionsProperty } from "../interfaces";

/**
 * It is an extension of the Kernel.
 * The injection system is not enough because React does not give access to its Factory.
 * We process an instance on the #componentWillMount() via @attach.
 * Processing allowed all features:
 * - @on, @inject, @state, @env
 *
 * However, as we don't know WHEN component is created (by React), we can't create a real dependency tree.
 * > This is why, you can't declare providers inside a React Component. (Unless if you make a implicit declaration.)
 *
 * Finally, we enhance @state and create a new feature: @action.
 *
 * Decorator @state will create also a refreshHandler with @on to re-render on each mutation.
 * Decorator @action wraps a method and allows logging/global try-catch/autobind.
 */
export class ComponentInjector {

  @inject
  protected kernel: Kernel;

  /**
   * Enhance kernel.inject behavior.
   *
   * @param definition    Component definition
   * @param instance      Instance
   * @param options
   */
  public inject(definition: Class, instance: Component, options: IAttachOptions = {}) {
    const self = this;

    // pre-process states (before the real kernel#processStates())
    this.processActions(definition, instance);

    const states = options.watch || this.getStates(definition);

    if (states.length > 0) {

      instance["auto$$refresh"] = function refreshHandler(this: any, event: IStateMutateEvent) {
        for (const name of states) {
          if (self.kernel["started"] && event.key === Global.keyify(name)) {
            instance.forceUpdate();
            return;
          }
        }
      };

      Meta.of({key: olyCoreKeys.events, target: definition.prototype, propertyKey: "auto$$refresh"}).set({
        name: olyCoreEvents.STATE_MUTATE,
      });
    }

    // just make a processing, skip registration and instantiation
    // NEVER REGISTER A REACT COMPONENT INSIDE THE KERNEL, NEVER; gygnygguuygnkuguyn
    this.kernel.inject(definition, {instance});
  }

  /**
   * Get states linked to a component.
   *
   * @param target      React component
   */
  public getStates(target: Class): string[] {

    const states: string[] = [];

    const statesMetadata = Meta.of({key: olyCoreKeys.states, target}).get();
    if (statesMetadata) {
      const keys = Object.keys(statesMetadata.properties);
      for (const propertyKey of keys) {
        const state = statesMetadata.properties[propertyKey];
        if (state.readonly) {
          continue;
        }
        states.push(state.name || Global.identity(target, propertyKey));
      }
    }

    const injectionsMetadata = Meta.of({key: olyCoreKeys.injections, target}).get();
    if (injectionsMetadata) {
      const keys2 = Object.keys(injectionsMetadata.properties);
      for (const propertyKey of keys2) {
        const injection = injectionsMetadata.properties[propertyKey];
        if (injection.type) {
          states.push(...this.getStates(injection.type));
        }
      }
    }

    return states;
  }

  /**
   * Wrap a method.
   *
   * @param target        React component
   * @param instance      Instance
   */
  public processActions(target: Class, instance: Component) {

    const self = this;
    const logger = this.kernel.inject(Logger).as("Actions");
    const actionsMetadata = Meta.of({key: olyReactKeys.actions, target}).get<IActionsMetadata>();
    if (!actionsMetadata) {
      return;
    }

    const keys = Object.keys(actionsMetadata.properties);
    for (const propertyKey of keys) {

      const action = actionsMetadata.properties[propertyKey];
      const resolve = this.actionResolveFactory(logger, target, action, instance);
      const reject = this.actionRejectFactory(logger, target, action, instance);

      instance[propertyKey + "$$copy"] = instance[propertyKey];
      instance[propertyKey] = function actionWrapper(event: any) {

        if (action.prevent && event) {
          if (typeof event.stopPropagation === "function") {
            event.stopPropagation();
          }
          if (typeof event.preventDefault === "function") {
            event.preventDefault();
          }
        }

        if (action.loading === true) {
          instance.setState({loading: true});
        } else if (typeof action.loading === "string") {
          instance.setState({[action.loading]: true});
        }

        if (typeof action.before === "object") {
          instance.setState(action.before);
        } else if (typeof action.before === "function") {
          action.before();
        }

        try {
          self.kernel.emit(olyReactEvents.ACTIONS_BEGIN, {
            action: action.name,
          });
          logger.trace(`run ${action.name}`);

          const data = instance[propertyKey + "$$copy"].apply(instance, arguments);
          if (!!data && !!data.then && !!data.catch) {
            return data.then(resolve).catch(reject);
          } else {
            return resolve(data);
          }
        } catch (e) {
          reject(e);
        }
      };

      // TODO: should be an option ?
      // Meta.of({key: olyCoreKeys.events, target: target.prototype, propertyKey}).set({name: action.name});
    }
  }

  /**
   * Experimental, "free" component.
   * Useful if component had events.
   */
  public free(instance: any) {
    if (typeof instance.__free__ === "function") {
      instance.__free__();
    }
  }

  /**
   *
   * @param logger
   * @param definition
   * @param action
   * @param instance
   * @return {(data:any)=>any}
   */
  protected actionResolveFactory(logger: Logger, definition: Function, action: IActionsProperty, instance: Component) {
    return (data: any) => {

      logger.debug(`action ${action.name} is done`);

      const actionResult: IActionResult<any> = {
        action: action.name,
        component: definition,
        data,
      };

      if (action.loading === true) {
        instance.setState({loading: false});
      } else if (typeof action.loading === "string") {
        instance.setState({[action.loading]: false});
      }

      if (typeof action.after === "object") {
        instance.setState(action.after);
      } else if (typeof action.after === "function") {
        action.after();
      }

      this.kernel.emit(olyReactEvents.ACTIONS_SUCCESS, actionResult);

      // you should't returns data, this is useless
      // -> catch data with emitter
      return data;
    };
  }

  /**
   *
   * @param logger
   * @param definition
   * @param action
   * @param instance
   * @return {(e:Error)=>undefined}
   */
  protected actionRejectFactory(logger: Logger, definition: Function, action: IActionsProperty, instance: Component) {
    return (e: Error) => {

      logger.warn(`action '${action.name}' has failed`, e);

      const actionResult: IActionResultError = {
        action: action.name,
        component: definition,
        error: e,
      };

      if (action.loading === true) {
        instance.setState({loading: false});
      } else if (typeof action.loading === "string") {
        instance.setState({[action.loading]: false});
      }

      if (typeof action.after === "object") {
        instance.setState(action.after);
      } else if (typeof action.after === "function") {
        action.after();
      }

      this.kernel.emit(olyReactEvents.ACTIONS_ERROR, actionResult);

      // do not throw the error, this is useless
    };
  }
}
