import { IArgumentsMetadata, IInjectionsMetadata, olyCoreKeys } from "../index";
import { BrowserLogger } from "../logger/BrowserLogger";
import { Logger } from "../logger/Logger";
import { ServerLogger } from "../logger/ServerLogger";
import { Meta } from "../metadata/Meta";
import { TypeParser } from "../type/TypeParser";
import { olyCoreErrors } from "./constants/errors";
import { olyCoreEvents } from "./constants/events";
import { Parent } from "./decorators/parent";
import { KernelException } from "./exceptions/KernelException";
import { Global, Global as _ } from "./Global";
import {
  IEventCallback,
  IEventListener,
  IEventReference,
  IEventsMetadata,
  IKernelEmitOptions,
  IKernelOnOptions,
  IListener,
  IObserver,
} from "./interfaces/events";
import {
  Class,
  IDeclaration,
  IDeclarations,
  IDefinition,
  IFactory,
  IInjectableMetadata,
  IKernelGetOptions,
  IProvider,
} from "./interfaces/injections";
import { IStateMutateEvent, IStatesMetadata, IStore } from "./interfaces/states";

/**
 * Kernel is a master class.
 *
 * There are 3 registries:
 * - Dependencies
 * - Events
 * - Store
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
 * ```ts
 * const kernel = new Kernel(store).with(...definitions);
 * await kernel.start();
 * ```
 */
export class Kernel {

  /**
   * This is a simple kernel factory.
   * Useful if you don't want see any 'new' keyword in your app.
   *
   * ```ts
   * Kernel
   *   .create()
   *   .with()
   *   .start()
   *   .catch(console.error);
   * ```
   *
   * @param store         Map of key-value.
   * @internal
   */
  public static create(store: IStore = {}) {

    if (_.isTest()) {
      store.LOGGER_LEVEL = store.LOGGER_LEVEL || "ERROR";
    }

    const kernel = new Kernel(store);

    if (_.isTest()
      && typeof beforeAll === "function"
      && typeof afterAll === "function") {
      beforeAll(() => kernel.start());
      afterAll(() => kernel.stop());
    }

    return kernel;
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
  private events: IEventListener[] = [];

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
        started: d.started,
        use: d.use,
      }));
    } else {
      // root kernel
      this.declarations = [];
      this.started = false;

      if (Global.isBrowser()) {
        this.inject({provide: Logger, use: BrowserLogger});
      } else {
        this.inject({provide: Logger, use: ServerLogger});
      }
    }
  }

  /**
   * Create a new kernel with the same definitions.
   * - declarations are cloned
   * - instances are cleared
   * - store is cleared
   * - new events are isolated
   *
   * Parent's store is stiff accessible.
   *
   * ```ts
   * const k = new Kernel({ A: "B", C: "D" });
   * const c = k.fork({ A: "F");
   * c.state("A"); // F
   * c.state("C"); // D
   * ```
   *
   * @param store     Map of key value
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
   *  .configure(k => k.inject(Service).andDoSomething(''))
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
  public async start(): Promise<Kernel> {

    this.getLogger().trace("start kernel");

    const declarations = this.sortDeclarations(this.declarations);

    try {

      for (const declaration of declarations) {
        if (declaration.instance && !declaration.started && declaration.instance.onConfigure) {
          this.getLogger().debug("configure " + declaration.definition.name);
          await declaration.instance.onConfigure(this.declarations);
        }
      }

      for (const declaration of declarations) {
        if (declaration.instance && !declaration.started && declaration.instance.onStart) {
          this.getLogger().debug("start " + declaration.definition.name);
          await declaration.instance.onStart(this.declarations);
          declaration.started = true;
        }
      }

    } catch (e) {
      this.getLogger().warn("the kernel's starting has failed.");
      await this.stop();
      throw e;
    }

    this.started = true;
    this.getLogger().info("kernel has been successfully started");
    return this;
  }

  /**
   * Unlock the kernel. Trigger #onStop on each provider.
   */
  public async stop(): Promise<Kernel> {

    this.getLogger().trace("stop kernel");

    const declarations = this.sortDeclarations(this.declarations).reverse();

    for (const declaration of declarations) {
      if (declaration.instance && declaration.started && declaration.instance.onStop) {
        this.getLogger().debug("stop " + declaration.definition.name);
        await declaration.instance.onStop(this.declarations);
      }
    }

    if (this.started) {
      this.started = false;
      this.getLogger().info("kernel has been successfully stopped");
    }

    return this;
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
  public with(...definitions: Array<Class | IDefinition>): Kernel {

    for (const definition of definitions) {
      if (!definition) {
        throw new KernelException(olyCoreErrors.injectableIsNull());
      }
      this.inject(definition);
    }

    return this;
  }

  /**
   * @deprecated Use Kernel#inject()
   * @internal
   */
  public get<T>(definition: Class<T> | IDefinition<T>, options: IKernelGetOptions<T> = {}): T {
    return this.inject(definition, options);
  }

  /**
   * Get a service based on a definition.
   *
   * ```ts
   * class A { b = "c" }
   * kernel.inject(A).b; // "c"
   * ```
   *
   * @param definition          IDefinition or IDefinition
   * @param options             Injection options
   */
  public inject<T>(definition: Class<T> | IDefinition<T>, options: IKernelGetOptions<T> = {}): T {

    // skip declaration, just inject
    if (typeof definition === "function" && (options.register === false || !!options.instance)) {
      return this.processMetadata<T>(definition, options.instance);
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
    const match: IDeclaration | undefined = this.declarations.filter((i) =>
      _.isEqualClass(i.definition, target.provide) ||
      _.isEqualClass(i.use, target.provide))[0];

    // check if dependency will be updated
    if (target.use && match && match.use !== target.use) {
      if (this.started) {
        throw new KernelException(olyCoreErrors.noDepUpdate(target.provide.name));
      }

      // remove current declaration
      this.removeDependency(match);

      // and recreate it with our new config
      return this.inject(definition, options);
    }

    const dependency: IDeclaration<T> = !!match
      ? match as IDeclaration<T>
      : this.createDependency<T>(target);

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
   * @param key           Identifier as string who defined the value
   * @param newValue      Optional new value (setter mode)
   */
  public state(key: string, newValue?: any): any {

    // identifier is case insensitive
    const identifier = Global.keyify(key);

    if (identifier === "KERNEL_ID") {
      return this.id;
    }

    if (typeof this.store[identifier] !== "undefined" && typeof newValue === "undefined") {
      return this.store[identifier];
    }

    if (this.parent) {
      const parentValue = this.parent.state(identifier);
      if (typeof parentValue !== "undefined") {

        // TODO: disabled by default (and allowed with something like @state({inherit: true}))
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
   * ```ts
   * kernel = Kernel.create({a: "true"});
   * kernel.env("a"); // true
   * kernel.state("a"); // "true"
   * ```
   *
   * @param key         Identifier as string who defined the value
   * @param forceType   Convert string on given type (number or boolean only) when it's possible
   */
  public env(key: string, forceType?: Function): any {

    let value = this.state(key);

    if (typeof value === "string") {
      value = _.template(value, this.store);
    }

    if (forceType) {
      value = TypeParser.parse(forceType, value);
    }

    return value;
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Register an event with a key (identifier) and an action.
   * This is the under-the-hood of `@on()`.
   *
   * ```ts
   * kernel.on("wat", () => console.log("Hi!"));
   * ```
   *
   * @param key             Event name
   * @param action          What to do
   * @param options         Listener options
   * @param options.unique  If yes, event will be deleted on the first call
   */
  public on(key: string, action: IEventCallback | IEventReference = _.noop, options: IKernelOnOptions = {}): IObserver {
    const unique = options.unique === true;
    const event: IEventListener = {key, action, unique};
    this.events.push(event);
    return {
      free: () => {
        event.disabled = true;
        this.events.splice(this.events.indexOf(event), 1);
      },
      wait: () => {
        event.disabled = true;
        this.events.splice(this.events.indexOf(event), 1);
        return new Promise((resolve) => this.on(key, resolve, {unique}));
      },
    };
  }

  /**
   * Fire an event.
   *
   * @param key               Event name
   * @param data              Event data (parameters)
   * @param options           Emitter options
   */
  public async emit(key: string, data?: any, options: IKernelEmitOptions = {}): Promise<any> {

    const invokeAction = (event: IEventListener, additionalArguments: any[]): Function => {
      if (typeof event.action === "function") {
        return event.action(additionalArguments[0]);
      }
      const propertyKey = event.action.propertyKey;
      if (options.fork) {
        return this.fork().invoke(event.action.target, propertyKey, additionalArguments);
      }
      return this.invoke(event.action.instance || event.action.target, propertyKey, additionalArguments);
    };

    const actions = this.events.filter((event) => event.key === key).map((event) => {
      if (event.unique) {
        this.events.splice(this.events.indexOf(event), 1);
      }
      return async (): Promise<any> => {

        if (event.disabled) {
          this.getLogger().trace(`event '${event.key}' is disabled`);
          return;
        }

        try {
          return await invokeAction(event, [data]);
        } catch (e) {
          this.getLogger().warn(`handle event '${key}' error`, e);
          return e;
        }
      };
    });

    if (options.sequential === true) {
      const results = [];
      for (const a of actions) {
        results.push(await a());
      }
      return results;
    }

    return Promise.all(actions.map((a) => a()));
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Call a method.
   *
   * @param definition            Class or Instance, class will be instantiate.
   * @param propertyKey           Name of the method.
   * @param additionalArguments
   */
  public invoke<T>(definition: Class<T> | T, propertyKey: keyof T, additionalArguments: any[] = []): any {

    // target is captured only for extracting metadata
    const target = typeof definition === "object" ? definition.constructor as Class<T> : definition;

    // instance can be created (e.g Controller) or directly used (e.g ReactComponent)
    const instance: T = typeof definition === "object" ? definition : this.inject(target);

    // instance.propertyKey MUST BE a function
    const action: any = instance[propertyKey];
    if (typeof action !== "function") {
      throw new KernelException(olyCoreErrors.isNotFunction(propertyKey, typeof action));
    }

    // metadata will tell us arguments to inject in the call
    const meta = Meta.of({key: olyCoreKeys.arguments, target}).deep<IArgumentsMetadata>();
    const args: any[] = meta && meta.args[propertyKey]
      ? meta.args[propertyKey].map((data) => data && data.handler(this, additionalArguments))
      : [];

    this.getLogger().trace(`invoke ${_.identity(definition, propertyKey)}(${args.length})`);

    return action.apply(instance, args.concat(additionalArguments));
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Create and register a new dependency based on a IDefinition (provide/use).
   *
   * @param target  IDeclaration candidate
   */
  private createDependency<T>(target: IDefinition<T>): IDeclaration<T> {

    if (typeof target.use !== "undefined" && typeof target.use !== "function") {
      throw new KernelException(olyCoreErrors.isNotFunction("use", typeof target.use));
    }

    const injectableMetadata = Meta.of({
      key: olyCoreKeys.injectable,
      target: target.use || target.provide,
    }).deep<IInjectableMetadata>();

    const injectionsMetadata = Meta.of({
      key: olyCoreKeys.injections,
      target: target.provide,
    }).deep<IInjectionsMetadata>();

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
      started: false,
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
  private removeDependency(declaration: IDeclaration<IListener>): void {
    const index = this.declarations.indexOf(declaration);
    if (index > -1) {
      this.declarations.splice(index, 1);
    }
    if (declaration.instance && typeof declaration.instance.__free__ === "function") {
      declaration.instance.__free__();
    }
    declaration.children
      .map((c) => this.declarations.filter((d) => d.definition === c.type)[0])
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
  private createInstance<T>(dependency: IDeclaration<T>, parent?: Class) {

    const func = dependency.use as any;

    // rules of isFactory
    const isFactory = !func.prototype || func.name === "use" || func.name === "";

    if (isFactory) {

      // /!\ WHEN SWAP, parentDependency = TARGET ! < not the new and shiny version >

      const instance: T = (func as IFactory<T>)(this, parent);

      return this.processMetadata<T>(instance.constructor as Class<T>, instance);
    }

    return this.processMetadata<T>(dependency.use as Class<T>, undefined, parent);
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
   * @param parent
   * @returns {T}         The new instance
   */
  private processMetadata<T extends IProvider>(definition: Class<T>, instance?: T, parent?: Class): T {

    const meta = Meta.of({key: olyCoreKeys.arguments, target: definition}).deep<IArgumentsMetadata>();
    const args: any[] = meta && meta.args.$constructor
      ? meta.args.$constructor.map((data) => data && data.handler(this, [parent]))
      : [];

    const newInstance = instance || new definition(...args);
    return this.processStates(definition,
      this.processEvents(definition,
        this.processInjections(definition, newInstance)));
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
   * class A { get b() { return kernel.inject(B) } }
   * ```
   *
   * Exception for the factories, there are instantiated here only once by definition.
   *
   * @param definition   Function/Class/Definition with IInjectionsMetadata
   * @param instance     Instance which will be processed
   */
  private processInjections<T>(definition: Class<T>, instance: T): T {

    const injections = Meta.of({key: olyCoreKeys.injections, target: definition}).deep<IInjectionsMetadata>();
    if (injections) {

      const keys = Object.keys(injections.properties);
      for (const propertyKey of keys) {
        if (typeof instance[propertyKey] === "undefined") {

          const injection = injections.properties[propertyKey];
          if (_.isEqualClass(injection.type, Kernel)) {
            Object.defineProperty(instance, propertyKey, {get: () => this});
          } else if (_.isEqualClass(injection.type, Parent)) {
            Object.defineProperty(instance, propertyKey, {get: () => definition});
          } else {

            const value = this.inject(injection.type, {parent: definition});
            const injectable = Meta.of({
              key: olyCoreKeys.injectable,
              target: injection.type,
            }).deep<IInjectableMetadata>();

            if (injectable && injectable.target.singleton === false) {
              Object.defineProperty(instance, propertyKey, {
                get: () => value,
              });
            } else {
              Object.defineProperty(instance, propertyKey, {
                get: () => this.inject(injection.type, {parent: definition}),
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
  private processStates<T>(definition: Class<T>, instance: T): T {

    const statesMetadata = Meta.of({key: olyCoreKeys.states, target: definition}).deep<IStatesMetadata>();
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
            set: (newValue: any) => this.state(stateName, newValue),
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
  private processEvents<T>(definition: Class<T>, instance: T): T {

    const eventsMetadata = Meta.of({key: olyCoreKeys.events, target: definition}).deep<IEventsMetadata>();
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
        (instance as IListener).__free__ = () => {
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
  private forceProvideDecorator<T>(definition: IDefinition) {
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
   * Bubble sort declarations by requirement.
   * Used by #start() and #stop().
   */
  private sortDeclarations(declarations: IDeclarations): IDeclarations {
    return _.bubble(declarations, (list, index) => {
      const findDefinitionInTree = (declaration: IDeclaration<any>, definition: Function) => {

        if (_.isEqualClass(declaration.definition, definition)) {
          return true;
        }

        for (const child of declaration.children) {
          const childDependency = declarations.filter((d: IDeclaration<any>) =>
            _.isEqualClass(d.definition, child.type))[0];
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
   * Internal logger.
   */
  private getLogger() {
    if (!this.logger) {
      this.logger = this.inject(Logger, {parent: Kernel});
    }
    return this.logger;
  }
}
