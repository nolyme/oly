import { Meta } from "../decorator/Meta";
import { IArgumentsMetadata, IInjectionsMetadata, olyCoreKeys } from "../index";
import { Logger } from "../logger/Logger";
import { olyCoreErrors } from "./constants/errors";
import { olyCoreEvents } from "./constants/events";
import { KernelException } from "./exceptions/KernelException";
import {
  IEventCallback,
  IEventListener,
  IEventReference,
  IEventsMetadata,
  IKernelEmitOptions,
  IKernelOnOptions,
  IObserver,
} from "./interfaces/events";
import {
  Class,
  IDeclaration,
  IDeclarations,
  IDefinition,
  IFactoryOf,
  IInjectableMetadata,
  IKernelGetOptions,
} from "./interfaces/injections";
import { IStateMutateEvent, IStatesMetadata, IStore } from "./interfaces/states";
import { CommonUtil as _ } from "./utils/CommonUtil";

/**
 * Kernel is a registry as context.
 * All the oly world depends on Kernel.
 *
 * There are three things: Dependencies, States and Events.
 * - Dependencies are classes declarations with relations.
 * - States are a group of data stored in a map<key,value> called 'store'.
 * - Events are functions triggered on a specific moment.
 *
 * Kernel#with(...definitions) will register new definition(s) and create instances.
 * A definition is just a class or a rule (e.g {provide: Class, use: Class2})
 *
 * The tree dependency is here for describe how your kernel works.
 *
 * Instances can be orchestrated with Kernel#start() and Kernel#stop() where
 * each instance#onStart() will be called.
 * If you define #onStart() or #onStop on a class, the kernel will tag him as Provider.
 * Kernel#start() will also lock your kernel by rejecting new providers.
 * Vice versa, Kernel#stop() unlock the kernel.
 *
 * The kernel can be forked to create multi child-context with Kernel#fork().
 * The child keep all the declarations but without any data (instances, store, ...).
 * No #start() nor #stop() are triggered. We assume that's already done by the parent.
 *
 * ```typescript
 * const kernel = new Kernel(store).with(...definitions);
 * await kernel.start();
 * ```
 */
export class Kernel {

  /**
   * This is a simple kernel factory.
   * Useful if you don't want see any 'new' keyword in your app.
   *
   * ```typescript
   * Kernel
   *   .create()
   *   .with()
   *   .start()
   *   .catch(console.error);
   * ```
   *
   * @param store         Map of key-value.
   */
  public static create(store?: IStore) {
    return new Kernel(store);
  }

  /**
   * Immutable context identifier.
   * Each kernel instance have an id. (12 random chars)
   * On every fork, we create a new id based on the parent id. (parentId + '.' + 12 random chars)
   *
   * This is your only way to identify a context.
   */
  public readonly id: string;

  /**
   * Events registry.
   */
  protected events: IEventListener[] = [];

  /**
   * Declarations registry.
   */
  private declarations: IDeclarations;

  /**
   * States registry.
   *
   * "Global" data of the kernel.
   * This is a map (key - value).
   * Once a key is created, you can't delete it.
   * Value is R/W by default. W is optional.
   * Kernel children can access to the parent store.
   * Use store only for data provider, like HttpServer, DatabaseConnection.
   */
  private store: IStore;

  /**
   * Is your kernel locked ?
   * True after #start(), false by default.
   * True for a child of started parent.
   * When started=true, registration isn't allowed for providers.
   */
  private started: boolean;

  /**
   * Ref to parent when #fork().
   * Useful for keep an eye on the parent's store. ;)
   */
  private parent?: Kernel;

  /**
   * Lazy logger ref.
   */
  private logger: Logger;

  /**
   * Create a new kernel.
   * First argument is a initial store, for configuration.
   * Then, there is the 'parent' argument which create a fork.
   *
   * @param store  Set env with some data.
   * @param parent When you fork kernel.
   */
  constructor(store: IStore = {}, parent?: Kernel) {

    this.id = _.shortid();
    this.store = {};

    for (const key of Object.keys(store)) {
      this.state(key, store[key]);
    }

    if (!!parent) {
      // when parent is defined (with a fork())
      this.id = parent.id + "." + this.id;
      this.parent = parent;
      this.started = parent.started;
      // topology is copied, definitions are cloned but instances are deleted
      this.declarations = parent.declarations.map((d) => ({
        children: d.children,
        definition: d.definition,
        singleton: d.singleton,
        use: d.use,
      }));
    } else {
      // root kernel
      this.declarations = [];
      this.started = false;
    }
  }

  /**
   * Create a new kernel with the same definitions.
   * - declarations are cloned
   * - but instances are cleared
   * - store is cleared
   * - but daddy store is accessible
   * - events are isolated
   */
  public fork(store?: any): Kernel {
    return new Kernel(store, this);
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Fluent inline configuration.
   * Examples are available on 'configurations.ts' files.
   *
   * ```ts
   * new Kernel()
   *  .configure(k => k.get(Service).andDoSomething(''))
   *  .start()
   * ```
   *
   * @param configuration   Function to execute
   * @returns               Kernel instance
   */
  public configure(configuration: (kernel: Kernel) => void): this {
    configuration(this);
    return this;
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Trigger onStart of each provider.
   * Lock your kernel against new provider registrations.
   *
   * All onStart() are sorted by link declarations.
   * All onStart() have a access to "this.declarations".
   * All onStart() are asynchronous, promise based.
   */
  public start(): Promise<Kernel> {

    if (this.started) {
      throw new KernelException(olyCoreErrors.alreadyStarted());
    }

    this.getLogger().trace("start kernel");

    this.started = true;

    const declarations = _.sortDeclarations(this.declarations);

    return _.cascade(declarations
      .filter((d) => !!d.instance && !!d.instance.onConfigure)
      .map((d) => () => {
        this.getLogger().debug("configure " + d.definition.name);
        return d.instance.onConfigure(this.declarations);
      }),
    ).then(() =>
      _.cascade(declarations
        .filter((d) => !!d.instance && !!d.instance.onStart)
        .map((d) => () => {
          this.getLogger().debug("start " + d.definition.name);
          return d.instance.onStart(this.declarations);
        }),
      ),
    ).then(() => {
      this.getLogger().info("kernel has been successfully started");
      return this;
    });
  }

  /**
   * Unlock the kernel. Trigger #onStop on each provider.
   */
  public stop(): Promise<Kernel> {

    if (!this.started) {
      throw new KernelException(olyCoreErrors.notStarted());
    }

    this.getLogger().trace("stop kernel");

    return _.cascade(_.sortDeclarations(this.declarations)
      .filter((d) => !!d.instance && !!d.instance.onStop)
      .reverse()
      .map((d) => () => {
        this.getLogger().debug("stop " + d.definition.name);
        return d.instance.onStop(this.declarations);
      }),
    ).then(() => {
      this.started = false;
      this.getLogger().info("kernel has been successfully stopped");
      return this;
    });
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Chain declarations here.
   * This is just a fluent version of {@see Kernel#get()} .
   *
   * @param definitions   List of definitions.
   * @return              Kernel instance.
   */
  public with(...definitions: Array<Class<any> | IDefinition<any>>): Kernel {

    for (const injectable of definitions) {
      if (!injectable) {
        throw new KernelException(olyCoreErrors.injectableIsNull());
      }
      this.get(injectable);
    }

    return this;
  }

  /**
   * Get a service based on a definition.
   *
   * ```typescript
   * class A { b = "c" }
   * kernel.get(A).b; // "c"
   * ```
   *
   * @param definition          IDefinition or IDefinition
   * @param [options]           Injection options
   * @param [options.parent]    Who want this dependency, default `undefined`
   * @param [options.register]  Register definition ? default `true`
   * @param [options.instance]  Do we have already an instance ? default `undefined`
   */
  public get<T>(definition: Class<T> | IDefinition<T>, options: IKernelGetOptions = {}): T {

    // skip declaration, just inject
    if (typeof definition === "function" && (options.register === false || !!options.instance)) {
      return this.inject<T>(definition, options.instance);
    }

    // easy parameters
    const target: IDefinition<T> =
      !!(definition as any).provide
        ? definition as any
        : {provide: definition};

    // [PLUGIN] for 'provide' with decorator
    this.forceProvideDecorator(target);

    if (typeof target.provide !== "function" || !target.provide.name) {
      throw new KernelException(olyCoreErrors.isNotFunction("provide", typeof target.provide));
    }

    // check if dependency already exists
    // -> `definition` is the first criteria of research
    // -> but if you are doing a swap, the real criteria is `use`, not `definition`
    const match = this.declarations.find((i) =>
      _.isEqualClass(i.definition, target.provide) || _.isEqualClass(i.use, target.provide));

    // check if dependency will be updated
    if (!!target.use && match && match.use !== target.use) {
      if (this.started) {
        throw new KernelException(olyCoreErrors.noDepUpdate(target.provide.name));
      }

      // remove current declaration
      this.removeDependency(match);

      // and recreate it with our new config
      return this.get(definition, options);
    }

    const dependency = !!match
      ? match
      : this.createDependency(target);

    // by default, each dep is a lazy singleton
    if (dependency.singleton) {
      if (!dependency.instance) {
        dependency.instance = this.createInstance(dependency, options.parent);
      }
      return dependency.instance;
    } else {
      // non singleton instance => create each time a new instance
      return this.createInstance<T>(dependency, options.parent);
    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Getter/Setter for store and parent's store.
   *
   * If key doesn't exists on this kernel, we will check on the parent.
   *
   * References can be updated. This is the power of @state, everybody has the same value at the same time.
   * An event is fired on each mutation: "state:mutate" {@see IStateMutateEvent}.
   *
   * @param identifier   Identifier as string who defined the value
   * @param newValue     Optional new value (setter mode)
   */
  public state(identifier: string, newValue?: any): any {

    if (!!this.parent) {
      const parentValue = this.parent.state(identifier);
      if (typeof parentValue !== "undefined") {
        if (typeof newValue !== "undefined") {
          return this.parent.state(identifier, newValue);
        }
        return parentValue;
      }
    }

    if (typeof newValue !== "undefined") {
      if (this.store[identifier] !== newValue) {
        const event: IStateMutateEvent = {key: identifier, newValue, oldValue: this.store[identifier]};
        this.store[identifier] = newValue;
        this.emit(olyCoreEvents.STATE_MUTATE, event);
      }
    }

    return this.store[identifier];
  }

  /**
   * Same as state, but "readonly".
   * This is fake "readonly" if you set objects!!!
   * You have to use only primitives (string, number, ...) as "env" to have true "readonly".
   * This is the under-the-hood of `@env()`.
   *
   * String numeric value are parsed to Number.
   * String boolean are parsed to Boolean.
   * ```typescript
   * kernel = Kernel.create({a: "true"});
   * kernel.env("a"); // true
   * kernel.state("a"); // "true"
   * ```
   *
   * @param key         Identifier as string who defined the value
   * @param forceType   Convert string on given type (number or boolean only) when it's possible
   */
  public env(key: string, forceType?: Function | Function): any {
    const value = this.state(key);

    if (typeof value === "string") {
      if (forceType && forceType === Boolean && value === "true") {
        return true;
      } else if (forceType && forceType === Boolean && value === "false") {
        return false;
      } else if (forceType && forceType === Number && !isNaN(value as any)) {
        return Number(value);
      } else {
        return _.template(value, this.store);
      }
    }

    return value;
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Register an event with a key (identifier) and an action.
   * This is the under-the-hood of `@on()`.
   *
   * ```typescript
   * kernel.on("wat", () => console.log("Hi!"));
   * ```
   *
   * @param key             Event name
   * @param action          What to do
   * @param options         Listener options
   * @param options.unique  If yes, event will be deleted on the first call
   */
  public on(key: string, action: IEventCallback | IEventReference, options: IKernelOnOptions = {}): IObserver {
    const unique = options.unique === true;
    const event = {key, action, unique};
    this.events.push(event);
    return {
      free: () => this.events.splice(this.events.indexOf(event), 1),
      wait: () => new Promise((resolve) => this.on(key, resolve, unique)),
    };
  }

  /**
   * Fire an event.
   *
   * @param key               Event name
   * @param data              Event data (parameters)
   * @param options           Emitter options
   * @param options.parent    If yes, event is sent to parent too
   * @param options.fork      If yes, kernel is forked for each call
   */
  public emit(key: string, data?: any, options: IKernelEmitOptions = {}): Promise<any> {

    const createAction = (event: IEventListener): Function => {
      if (typeof event.action === "function") {
        return event.action;
      }
      if (options.fork) {
        const instance = this.fork().get(event.action.target);
        return instance[event.action.propertyKey].bind(instance);
      }
      return event.action.instance[event.action.propertyKey].bind(event.action.instance);
    };

    const promises = this.events
      .filter((event) => event.key === key)
      .map((event) => {
        if (event.unique) {
          this.events.splice(this.events.indexOf(event), 1);
        }
        return Promise.resolve()
          .then(() => _.promise(createAction(event)(data)))
          .catch((e) => {
            this.getLogger().warn(`handle event['${key}'] error`, e);
            return e;
          });
      });

    if (options.parent && this.parent) {
      promises.push(this.parent.emit(key, data, options));
    }

    return Promise.all<any>(promises);
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   *
   * @param definition
   * @param propertyKey
   */
  public invoke<T>(definition: Class<T> | T, propertyKey: keyof T): Promise<any> {

    const target = typeof definition === "object" ? definition.constructor as Class<T> : definition;
    const instance: T = typeof definition === "object" ? definition : this.get(target);
    const action: any = instance[propertyKey];

    if (typeof action !== "function") {
      throw new KernelException(olyCoreErrors.isNotFunction(propertyKey, typeof action));
    }

    const meta = Meta.of({key: olyCoreKeys.arguments, target}).get<IArgumentsMetadata>();
    const args: any[] = meta && meta.args[propertyKey]
      ? meta.args[propertyKey].map((data) => data.handler(this))
      : [];

    this.getLogger().info(`invoke ${_.identity(definition, propertyKey)}(${args.length})`);

    return new Promise<any>((resolve) => resolve(action.apply(instance, args)));
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Check if NODE_ENV of store (not process.env) equal production.
   *
   * @internal
   * @return true if store['NODE_ENV'] === 'production'
   */
  public isProduction() {
    return this.state("NODE_ENV") === "production";
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Create and register a new dependency based on a IDefinition (provide/use).
   *
   * @param target  IDeclaration candidate
   */
  protected createDependency<T>(target: IDefinition<T>): IDeclaration<T> {

    if (typeof target.use !== "undefined" && typeof target.use !== "function") {
      throw new KernelException(olyCoreErrors.isNotFunction("use", typeof target.use));
    }

    const injectableMetadata = Meta.of({
      key: olyCoreKeys.injectable,
      target: target.use || target.provide,
    }).get<IInjectableMetadata>();

    const injectionsMetadata = Meta.of({
      key: olyCoreKeys.injections,
      target: target.provide,
    }).get<IInjectionsMetadata>();

    const singleton = injectableMetadata
      ? injectableMetadata.target.singleton !== false
      : true;

    // now, we take the explicit use, or the implicit use or the provider
    // this is important to keep the use reference when you make a swap
    const use = injectableMetadata && injectableMetadata.target.use
      ? injectableMetadata.target.use
      : (target.use || target.provide);

    if (typeof use !== "function") {
      throw new KernelException(olyCoreErrors.isNotFunction("use", typeof use));
    }

    if (this.started && singleton && _.isProvider(target.provide)) {
      throw new KernelException(olyCoreErrors.noDepAfterStart(target.provide.name));
    }

    const declaration: IDeclaration<T> = {
      children: injectionsMetadata ? Object
        .keys(injectionsMetadata.properties)
        .map((k) => injectionsMetadata.properties[k]) : [],
      definition: target.provide,
      singleton,
      use,
    };

    // register declaration
    this.declarations.push(declaration);

    return declaration;
  }

  /**
   * Remove a dependency from kernel.
   *
   * - This will removed all unused children and free() events.
   * - However state is kept.
   *
   */
  protected removeDependency(declaration: IDeclaration<any>): void {
    const index = this.declarations.indexOf(declaration);
    if (index > -1) {
      this.declarations.splice(index, 1);
    }
    if (declaration.instance && typeof declaration.instance.__free__ === "function") {
      declaration.instance.__free__();
    }
    declaration.children
      .map((c) => this.declarations.find((d) => d.definition === c.type))
      .forEach((c) => {
        if (c) {
          this.removeDependency(c);
        }
      });
  }

  /**
   * Use #inject() on a dependency.
   * Take care of factory if needed.
   *
   * @param dependency  Kernel dependency
   * @param parent      Instance who requires this instance
   */
  protected createInstance<T>(dependency: IDeclaration<T>, parent?: Function) {

    const func = dependency.use as any;

    // rules of isFactory
    const isFactory = !func.prototype || func.name === "use" || func.name === "";

    if (isFactory) {

      // /!\ WHEN SWAP, parentDependency = TARGET ! < not the new and shiny version >

      const instance: T = (func as IFactoryOf<T>)(this, parent);

      return this.inject<T>(instance.constructor as Class<T>, instance);
    }

    return this.inject<T>(dependency.use as Class<T>);
  }

  /**
   * Internal function of @inject.
   * - create instance with definition if no instance is provided
   * - process env/state then link injection
   *
   * There is not a registration.
   *
   * @param definition    IDefinition (e.g description of the instance)
   * @param instance      Instance to use, optional
   * @returns {T}         The new instance
   */
  protected inject<T>(definition: Class<T>, instance?: T): T {

    const meta = Meta.of({key: olyCoreKeys.arguments, target: definition}).get<IArgumentsMetadata>();
    const args: any[] = meta && meta.args.$constructor
      ? meta.args.$constructor.map((data) => data.handler(this))
      : [];

    return (
      this.processStates(definition,
        this.processEvents(definition,
          this.processInjections(definition, instance || new definition(...args)))));
  }

  /**
   * Read IInjectionsMetadata of a definition and apply the rules on the given instance.
   * Each "injections" will create a virtual getter.
   *
   * ```
   * class A { @inject b: B }
   * ```
   *
   * will be transformed into:
   * ```
   * class A { get b() { return kernel.get(B) } }
   * ```
   *
   * Exception for the factories, there are instantiated here only once by definition.
   *
   * @param definition   Function/Class/Definition with IInjectionsMetadata
   * @param instance     Instance which will be processed
   */
  protected processInjections<T>(definition: Class<T>, instance: T): T {

    const injections = Meta.of({key: olyCoreKeys.injections, target: definition}).get<IInjectionsMetadata>();
    if (injections) {

      const keys = Object.keys(injections.properties);
      for (const propertyKey of keys) {
        if (typeof instance[propertyKey] === "undefined") {

          const injection = injections.properties[propertyKey];
          if (_.isEqualClass(injection.type, Kernel)) {
            Object.defineProperty(instance, propertyKey, {get: () => this});
          } else {

            const value = this.get(injection.type, {parent: definition});
            const injectable = Meta.of({
              key: olyCoreKeys.injectable,
              target: injection.type,
            }).get<IInjectableMetadata>();

            if (injectable && injectable.target.singleton) {
              Object.defineProperty(instance, propertyKey, {
                get: () => value,
              });
            } else {
              Object.defineProperty(instance, propertyKey, {
                get: () => this.get(injection.type, {parent: definition}),
              });
            }
          }
        }
      }
    }

    return instance;
  }

  /**
   * Auto state/env.
   * Set virtual for each @state / @env.
   *
   * @param definition   IDefinition with @state / @env
   * @param instance     Instance to processed
   */
  protected processStates<T>(definition: Class<T>, instance: T): T {

    const statesMetadata = Meta.of({key: olyCoreKeys.states, target: definition}).get<IStatesMetadata>();
    if (statesMetadata) {

      const keys = Object.keys(statesMetadata.properties);
      for (const propertyKey of keys) {

        const state = statesMetadata.properties[propertyKey];
        const stateName = state.name || _.identity(definition, propertyKey);
        const defaultValue = instance[propertyKey];

        // initialize state if possible
        if (typeof defaultValue !== "undefined") {
          const currentValue = this.state(stateName);
          if (typeof currentValue === "undefined") {
            this.state(stateName, defaultValue);
          }
        }

        if (state.readonly !== true) {
          Object.defineProperty(instance, propertyKey, {
            get: () => this.state(stateName),
            set: (newValue) => this.state(stateName, newValue),
          });
        } else {
          if (typeof this.state(stateName) === "undefined") {
            // when readonly + no default value, env is useless so we throw an error
            // for avoiding this, you need to set env = null
            throw new KernelException(olyCoreErrors.envNotDefined(stateName));
          }
          Object.defineProperty(instance, propertyKey, {
            get: () => this.env(stateName, state.type),
          });
        }
      }
    }

    return instance;
  }

  /**
   * Process @on().
   *
   * @param definition    IDefinition with event metadata
   * @param instance      Instance to decorate
   */
  protected processEvents<T>(definition: Class<T>, instance: T): T {

    const eventsMetadata = Meta.of({key: olyCoreKeys.events, target: definition}).get<IEventsMetadata>();
    if (eventsMetadata) {

      const observers: IObserver[] = [];
      const target = instance.constructor as Class<T>;
      const keys = Object.keys(eventsMetadata.properties);

      for (const propertyKey of keys) {
        const event = eventsMetadata.properties[propertyKey];
        const key = event.name || _.identity(definition, propertyKey);
        observers.push(this.on(key, {target, propertyKey, instance}));
      }

      if (observers.length > 0) {
        // this is currently used by oly-react
        instance["__free__"] = () => { // tslint:disable-line
          observers.forEach((obs) => obs.free());
        };
      }
    }

    return instance;
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Process injectable:provide.
   *
   * @param definition    Definition
   */
  protected forceProvideDecorator<T>(definition: IDefinition<T>) {
    const injectableMetadata = Meta.of({
      key: olyCoreKeys.injectable,
      target: definition.provide,
    }).get<IInjectableMetadata>();
    if (injectableMetadata && injectableMetadata.target.provide) {
      definition.use = definition.use || definition.provide;
      definition.provide = injectableMetadata.target.provide;
      this.forceProvideDecorator(definition);
    }
  }

  /**
   * Internal logger.
   */
  protected getLogger() {
    if (!this.logger) {
      this.logger = this.inject(Logger, new Logger(this.id).as("Kernel"));
    }
    return this.logger;
  }
}
