import {
  _,
  IAnyDefinition,
  IClass,
  IEventMetadataMap,
  inject,
  IStateMutate,
  IVirtualStateMetadataMap,
  Kernel,
  Logger,
  lyEvents,
  lyStates,
  MetadataUtil,
  olyCoreEvents,
} from "oly-core";
import { ACTIONS_ERROR, ACTIONS_SUCCESS, lyActions } from "../constants";
import { IActionMetadata, IActionMetadataMap, IActionResult, IActionResultError } from "../interfaces";

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
    // NEVER REGISTER A REACT COMPONENT INSIDE THE KERNEL, NEVER; gygnygguuygnkuguyn
    this.kernel.get(definition, {instance});

    // process actions
    this.processActions(definition, instance);
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
      if (state.readonly) {
        continue;
      }

      const events: IEventMetadataMap = MetadataUtil.get(lyEvents, instance.constructor);
      events[propertyKey + "$$refresh"] = {name: olyCoreEvents.STATE_MUTATE};
      MetadataUtil.set(lyEvents, events, instance.constructor);

      instance[propertyKey + "$$refresh"] = function refreshHandler(this: any, event: IStateMutate) {
        if (event.key === (state.name || _.identity(definition, propertyKey))) {
          this.setState({[event.key]: event.newValue});
        }
      };
    }
  }

  /**
   * Wrap a method.
   *
   * @param definition    React component
   * @param instance      Instance
   */
  public processActions(definition: IAnyDefinition, instance: object) {
    const actions: IActionMetadataMap = MetadataUtil.get(lyActions, definition, {});
    const logger = this.kernel.get(Logger).as("Actions");

    for (const propertyKey of Object.keys(actions)) {
      const action = actions[propertyKey];
      const resolve = this.actionResolveFactory(logger, definition, action);
      const reject = this.actionRejectFactory(logger, definition, action);

      instance[propertyKey + "$$copy"] = instance[propertyKey];
      instance[propertyKey] = function actionWrapper(event: any) {
        try {
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
   * @return {(data:any)=>any}
   */
  protected actionResolveFactory(logger: Logger, definition: IClass, action: IActionMetadata) {
    return (data: any) => {

      logger.debug(`action ${action.name} is done`);

      const actionResult: IActionResult<any> = {
        action: action.name,
        component: definition,
        data,
      };

      this.kernel.emit(ACTIONS_SUCCESS, actionResult);

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
   * @return {(e:Error)=>undefined}
   */
  protected actionRejectFactory(logger: Logger, definition: IClass, action: IActionMetadata) {
    return (e: Error) => {

      logger.warn(`action ${action.name} has failed`, e);

      const actionResult: IActionResultError = {
        action: action.name,
        component: definition,
        error: e,
      };

      this.kernel.emit(ACTIONS_ERROR, actionResult);

      // do not throw the error, this is useless
    };
  }
}
