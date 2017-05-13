import { errors } from "./constants/errors";
import { lyDefinition, lyDependencies, lyEvents, lyStates } from "./constants/keys";
import {
  IEventCallback,
  IEventListener,
  IEventMetadataMap,
  IEventReference,
  IKernelEmitOptions,
  IKernelOnOptions,
  IObserver,
} from "./interfaces/events";
import {
  IAnyDeclaration,
  IAnyDefinition,
  IComplexDefinition,
  IDeclaration,
  IDefinition,
  IDefinitionMetadata,
  IDependencyMetadataMap,
  IKernelGetOptions,
} from "./interfaces/relations";
import { IStateMutate, IStore, IVirtualStateMetadataMap } from "./interfaces/store";
import { IAnyFunction, IClass, IFactoryOf } from "./interfaces/types";
import { Logger } from "./logger/Logger";
import { CommonUtil as _ } from "./utils/CommonUtil";
import { MetadataUtil } from "./utils/MetadataUtil";

/**
 * Kernel manages 3 concepts:
 * - declarations     Relational class definition with registration.
 * - store            Centralized application data.
 * - events           Event emitter.
 *
 * Kernel#with(...definitions) will register a new definition and create his instance.
 * IDefinition is just a class or a rule (e.g {provide: Class, use: Class2})
 *
 * The tree dependency is here for describe how your kernel works.
 * Instances can be orchestrated with Kernel#start() and Kernel#stop() where
 * each instance#onStart() will be called.
 *
 * If you define #onStart() or #onStop on a class, the kernel will tag him as Provider.
 *
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
   * @internal
   * @param store         Map of key-value. {@see Kernel.store}
   */
  public static create(store?: IStore) {
    return new Kernel(store);
  }

  /**
   * Immutable context identifier.
   * Each kernel instance have an id. (12 random chars)
   * On every fork, we create a new id based on the parent id. (parentId + '.' + 12 random chars)
   */
  public readonly id: string;

  /**
   * Events.
   */
  protected events: IEventListener[] = [];

  /**
   * All declarations.
   */
  private declarations: IAnyDeclaration[];

  /**
   * "Global" data of the kernel.
   * This is a map (key - value).
   * Once a key is created, you can't delete it.
   * Value is R/W by default. W is optional.
   * Kernel children can access to the parent store.
   * Use store only for data provider, like HttpServer, DatabaseConnection.
   * IStore is used by env.
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
   * Useful for keep an eye on the parent's store.
   */
  private parent?: Kernel;

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
      // when parent is defined -> fork()
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
   */
  public fork(store?: any): Kernel {
    return new Kernel(store, this);
  }

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
      throw errors.alreadyStarted();
    }

    this.getLogger().trace("start kernel");

    this.started = true;

    const deps = this.sortDeclarations();

    return _.cascade(deps
      .filter((d) => !!d.instance && !!d.instance.onConfigure)
      .map((d) => () => {
        this.getLogger().debug("configure " + d.definition.name);
        return d.instance.onConfigure(this.declarations);
      }),
    ).then(() =>
      _.cascade(deps
        .filter((d) => !!d.instance && !!d.instance.onStart)
        .map((d) => () => {
          this.getLogger().debug("start " + d.definition.name);
          return d.instance.onStart(this.declarations);
        }),
      ),
    ).then(() => {
      this.getLogger().debug("kernel has been successfully started");
      return this;
    });
  }

  /**
   * It's like a reverse #start().
   */
  public stop(): Promise<Kernel> {

    if (!this.started) {
      throw errors.notStarted();
    }

    this.getLogger().debug("stop kernel");

    return _.cascade(this.sortDeclarations()
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

  /**
   * Include another kernel or add some declarations.
   * This is just a fluent version of {@see Kernel.get} .
   *
   * @param definitions   List of definitions.
   * @return              Kernel instance.
   */
  public with(...definitions: Array<IDefinition<any> | IComplexDefinition<any>>): Kernel {

    for (const injectable of definitions) {
      if (!injectable) {
        throw errors.injectableIsNull();
      }
      this.get(injectable);
    }

    return this;
  }

  /**
   * Get a service based on a definition.
   * ```typescript
   * ```
   *
   * @param definition          IDefinition or Injectable
   * @param [options]           Injection options
   * @param [options.parent]    Who want this dependency, null by default
   * @param [options.register]  Register?
   */
  public get<T>(definition: IDefinition<T> | IComplexDefinition<T>, options: IKernelGetOptions = {}): T {

    // skip declaration, just inject
    if (typeof definition === "function" && (options.register === false || !!options.instance)) {
      return this.inject<T>(definition, options.instance);
    }

    // easy parameters
    const target: IComplexDefinition<T> =
      !!(definition as any).provide
        ? definition as any
        : {provide: definition};

    // [PLUGIN] for 'provide' with decorator
    this.forceProvideDecorator(target);

    if (typeof target.provide !== "function" || !target.provide.name) {
      throw errors.isNotFunction("provide", typeof target.provide);
    }

    // check if dependency already exists
    // -> `definition` is the first criteria of research
    // -> but if you are doing a swap, the real criteria is `use`, not `definition`
    const match = this.declarations.filter((i) => _.is(i.definition, target.provide) || _.is(i.use, target.provide))[0];

    if (!!target.use && match && match.use !== target.use) {
      throw errors.noDepUpdate(target.provide.name || "???");
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

  /**
   * Getter/Setter for store and parent's store.
   *
   * If key doesn't exists on this kernel, we will check on the parent.
   *
   * References can be updated. This is the power of @state, everybody has the same value at the same time.
   * An event is fired on each mutation: "state:mutate" {@see IStateMutate}.
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
        const mutation: IStateMutate = {key: identifier, newValue, oldValue: this.store[identifier]};
        this.store[identifier] = newValue;
        this.emit("state:mutate", mutation);
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
   * @param key   Identifier as string who defined the value
   */
  public env(key: string): any {
    const value = this.state(key);
    return _.parseNumberAndBoolean(value);
  }

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
    const promises = this.events
      .filter((event) => event.key === key)
      .map((event) => {
        if (event.unique) {
          this.events.splice(this.events.indexOf(event), 1);
        }
        try {
          let action: IAnyFunction;
          if (typeof event.action === "function") {
            action = event.action;
          } else {
            if (options.fork) {
              const instance = this.fork().get(event.action.target);
              action = instance[event.action.propertyKey].bind(instance);
            } else {
              action = event.action.instance[event.action.propertyKey].bind(event.action.instance);
            }
          }
          return _.promise(action(data)).catch((e) => {
            this.getLogger().warn(`handle event['${key}'] error`, e);
            return e;
          });
        } catch (e) {
          this.getLogger().warn(`handle event['${key}'] error`, e);
          return Promise.resolve(e);
        }
      });

    if (options.parent && this.parent) {
      promises.push(this.parent.emit(key, data, options));
    }

    return Promise.all<any>(promises);
  }

  /**
   * Check if NODE_ENV of store (not process.env) equal production.
   *
   * @internal
   * @return true if store['NODE_ENV'] === 'production'
   */
  public isProduction() {
    return this.state("NODE_ENV") === "production";
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
  protected inject<T>(definition: IAnyDefinition, instance?: T): T {
    return (
      this.processStates(definition,
        this.processEvents(definition,
          this.processInjections(definition, instance || new definition()))));
  }

  /**
   * Create and register a new dependency based on a injectable.
   *
   * @param target  IDeclaration candidate
   */
  protected createDependency<T>(target: IComplexDefinition<T>): IDeclaration<T> {

    if (typeof target.use !== "undefined" && typeof target.use !== "function") {
      throw errors.isNotFunction("use", typeof target.use);
    }

    const options: IDefinitionMetadata<T> = MetadataUtil.get(lyDefinition, target.use || target.provide);
    const injections: IDependencyMetadataMap = MetadataUtil.deep(lyDependencies, target.provide);

    options.singleton = options.singleton !== false;

    // now, we take the explicit use, or the implicit use or the provider
    // this is important to keep the use reference when you make a swap
    target.use = options.use || target.use || target.provide;

    if (typeof target.use !== "function") {
      throw errors.isNotFunction("use", typeof target.use);
    }

    if (this.started
      && options.singleton
      && this.isProvider(target.provide)
    ) {
      throw errors.noDepAfterStart(target.provide.name || "???");
    }

    const declaration: IDeclaration<T> = {
      children: Object.keys(injections).map((k) => injections[k]),
      definition: target.provide,
      singleton: options.singleton,
      use: target.use,
    };

    // register declaration
    this.declarations.push(declaration);

    return declaration;
  }

  /**
   * Check if a definition can be named as IProvider.
   *
   * @param definition      Class definition
   */
  protected isProvider(definition: IClass) {

    if (
      !!definition.prototype.onConfigure ||
      !!definition.prototype.onStart ||
      !!definition.prototype.onStop
    ) {
      return true;
    }

    const states: IVirtualStateMetadataMap = MetadataUtil.deep(lyStates, definition, {});
    for (const propertyKey of Object.keys(states)) {
      if (!states[propertyKey].readonly) {
        return true;
      }
    }

    return false;
  }

  /**
   * Use #inject() on a dependency.
   * Take care of factory if needed.
   *
   * @param dependency  Kernel dependency
   * @param parent      Instance who requires this instance
   */
  protected createInstance<T>(dependency: IDeclaration<T>, parent?: IClass) {

    const func = dependency.use as any;

    // rules of isFactory
    const isFactory = !func.prototype || func.name === "use" || func.name === "";

    if (isFactory) {

      // /!\ WHEN SWAP, parentDependency = TARGET ! < not the new and shiny version >

      const instance: T = (func as IFactoryOf<T>)(this, parent);

      return this.inject<T>(instance.constructor as IDefinition<T>, instance);
    }

    return this.inject<T>(dependency.use as any);
  }

  /**
   * Auto inject.
   * Set virtual for each @inject.
   *
   * @param definition   Kernel dependency
   * @param instance     Instance who requires this instance
   */
  protected processInjections<T>(definition: IAnyDefinition, instance: T): T {

    const dependencies: IDependencyMetadataMap = MetadataUtil.deep(lyDependencies, definition);

    for (const propertyKey of Object.keys(dependencies)) {
      const dependency = dependencies[propertyKey];

      if (typeof instance[propertyKey] === "undefined") {
        if (_.is(dependency.type, Kernel)) {
          Object.defineProperty(instance, propertyKey, {get: () => this});
        } else {
          const value = this.get(dependency.type, {parent: definition});
          Object.defineProperty(instance, propertyKey, {get: () => value});
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
  protected processStates<T>(definition: IAnyDefinition, instance: T): T {

    const states: IVirtualStateMetadataMap = MetadataUtil.deep(lyStates, definition);

    const keys = Object.keys(states);
    for (const propertyKey of keys) {

      const chunk = states[propertyKey];
      const chunkName = chunk.name || _.targetToString(definition, propertyKey);
      const defaultValue = instance[propertyKey];

      // initialize state if possible
      if (typeof defaultValue !== "undefined") {
        const currentValue = this.state(chunkName);
        if (typeof currentValue === "undefined") {
          this.state(chunkName, defaultValue);
        }
      }

      if (chunk.readonly !== true) {
        // state can be updated
        Object.defineProperty(instance, propertyKey, {
          get: () => this.env(chunkName),
          set: (newValue) => this.state(chunkName, newValue),
        });
      } else {
        if (typeof this.state(chunkName) === "undefined") {
          // when readonly + no default value, env is useless so we throw an error
          // for avoiding this, you need to set env = null
          throw errors.envNotDefined(chunkName);
        }
        Object.defineProperty(instance, propertyKey, {
          get: () => this.env(chunkName),
        });
      }
    }

    return instance;
  }

  /**
   * Internal logger.
   */
  protected getLogger() {
    return this.get(Logger).as("Kernel");
  }

  /**
   * Process @on().
   *
   * @param definition    IDefinition with event metadata
   * @param instance      Instance to decorate
   */
  protected processEvents<T>(definition: IAnyDefinition, instance: T): T {

    const events: IEventMetadataMap = MetadataUtil.deep(lyEvents, definition);
    const observers: IObserver[] = [];
    const target = instance.constructor as IClass;

    const keys = Object.keys(events);
    for (const propertyKey of keys) {
      const event = events[propertyKey];
      const key = event.name || _.targetToString(definition, propertyKey);
      observers.push(this.on(key, {target, propertyKey, instance}));
    }

    // hacky hack is hacky
    instance["__free__"] = () => { // tslint:disable-line
      observers.forEach((obs) => obs.free());
    };

    return instance;
  }

  /**
   * Bubble sort declarations by requirement.
   * Used by #start() and #stop().
   */
  protected sortDeclarations() {
    return _.bubble(this.declarations, (list, index) => {
      const findDefinitionInTree = (declaration: IAnyDeclaration, definition: IAnyDefinition) => {
        if (_.is(declaration.definition, definition)) {
          return true;
        }
        for (const child of declaration.children) {
          const childDependency = this.declarations.filter((d: IAnyDeclaration) =>
            _.is(d.definition, child.type))[0];
          if (!!childDependency && findDefinitionInTree(childDependency, definition)) {
            return true;
          }
        }
        return false;
      };
      return findDefinitionInTree(list[index], list[index + 1].definition);
    });
  }

  /**
   * Force provide with injectable decorator.
   *
   * ```typescript
   *  @injectable({provide: A})
   * class B extend A {}
   * new Kernel().with(B);
   * // ===
   * new Kernel().with({provide: A, use: B});
   * ```
   *
   * @param definition    Definition
   */
  protected forceProvideDecorator<T>(definition: IComplexDefinition<T>) {
    const options: IDefinitionMetadata<T> = MetadataUtil.get(lyDefinition, definition.provide);
    if (!!options && !!options.provide) {
      // force provide = keep NEW (use) or DEFAULT (provide)
      // THEN set provide equal to options
      definition.use = definition.use || definition.provide;
      definition.provide = options.provide;
      this.forceProvideDecorator(definition);
    }
  }
}
