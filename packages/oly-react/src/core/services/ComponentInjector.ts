import {
  _,
  IAnyDefinition,
  IEventMetadataMap,
  inject,
  IStateMutate,
  IVirtualStateMetadataMap,
  Kernel,
  Logger,
  lyEvents,
  lyStates,
  MetadataUtil
} from "oly-core";
import { ACTIONS_ERROR, ACTIONS_SUCCESS, lyActions } from "../constants";
import { IActionResult, IActionResultError } from "../interfaces";

/**
 * It is an extension of the Kernel.
 * The injection system is not enough because React does not give access to its Factory.
 * We process an instance on the #componentWillMount() via @attach.
 * Processing allowed all features:
 * - @on, @inject, @state, @env
 *
 * However, as we don't know WHEN component is created (by React), we can't create a real dependency tree.
 * This is why, you can't declare providers inside a React Component. (Unless if you make a implicit declaration.)
 *
 * Finally, we enhance @state and create a new feature: @action.
 *
 * Decorator @state decorator will create also a refreshHandler with @on to re-render on each mutation.
 * Decorator @action wraps a method and allows logging/global try-catch/autobind.
 */
export class ComponentInjector {

  @inject(Kernel)
  protected kernel: Kernel;

  /**
   * Enhance kernel.inject behavior.
   *
   * @param definition    Component definition
   * @param instance      Instance
   */
  public inject(definition: IAnyDefinition, instance: object) {

    // pre-process states (before the real kernel#processStates())
    this.processStates(definition, instance);

    // just make a processing, skip registration and instantiation
    // NEVER REGISTER A REACT COMPONENT INSIDE THE KERNEL, NEVER
    this.kernel.get(definition, {instance});

    // process actions
    this.processAction(definition, instance);
  }

  /**
   * Add an @on("state:mutate") to re-renderer the component on mutation.
   *
   * @param definition  React component
   * @param instance    Instance
   */
  public processStates(definition: IAnyDefinition, instance: object) {
    const states: IVirtualStateMetadataMap = MetadataUtil.get(lyStates, definition, {});
    const keys = Object.keys(states);
    for (const propertyKey of keys) {
      const state = states[propertyKey];
      if (!state.readonly) {
        const events: IEventMetadataMap = MetadataUtil.get(lyEvents, instance.constructor);
        events[propertyKey + "$$refresh"] = {
          name: "state:mutate",
        };
        MetadataUtil.set(lyEvents, events, instance.constructor);
        instance[propertyKey + "$$refresh"] = function refreshHandler(this: any, event: IStateMutate) {
          if (event.key === (state.name || _.targetToString(definition, propertyKey))) {
            this.setState({[event.key]: event.newValue});
          }
        };
      }
    }
  }

  /**
   * Wrap a method.
   *
   * @param definition    React component
   * @param instance      Instance
   */
  public processAction(definition: IAnyDefinition, instance: object) {
    const actions = MetadataUtil.get(lyActions, definition, {});
    const logger = this.kernel.get(Logger).as("Actions");
    for (const propertyKey of Object.keys(actions)) {
      const action: string = actions[propertyKey];
      const resolve = (data: any) => {
        logger.debug(`action ${action} is done`);
        const actionResult: IActionResult<any> = {
          action,
          component: definition,
          data,
        };
        this.kernel.emit(ACTIONS_SUCCESS, actionResult);
        return data;
      };
      const reject = (e: Error) => {
        logger.error(`action ${action} has failed`, e);
        const actionResult: IActionResultError = {
          action,
          component: definition,
          error: e,
        };
        this.kernel.emit(ACTIONS_ERROR, actionResult);
        throw e;
      };
      instance[propertyKey + "$$copy"] = instance[propertyKey];
      instance[propertyKey] = function actionWrapper() {
        try {
          logger.trace(`run ${action}`);
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
}
