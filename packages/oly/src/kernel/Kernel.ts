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
 * ```ts
 * Kernel
 *   .create(store)
 *   .with(...definitions);
 *   .start()
 *   .then(console.log)
 *   .catch(console.error)
 * ```
 *
 * Decorators:
 * - @inject -> Kernel#inject()
 * - @state -> Kernel#state()
 * - @env -> Kernel#env()
 * - @on -> Kernel#on()
 */
export class Kernel {

  /**
   * Factory.
   * This is recommended.
   *
   * ```ts
   * const store = {};
   * Kernel
   *   .create(store)
   *   .with()
   *   .start()
   *   .catch(console.error);
   * ```
   *
   * ### Jasmine, Jest, Protractor, ...
   *
   * if `process.env.NODE_ENV === "test"`,
   * beforeAll(() => kernel.start()) and  afterAll(() => kernel.stop()) are defined.
   *
   * ```ts
   * describe("something", () => {
   *
   *   const kernel = Kernel.create({DB_URL: "memory"});
   *   const ctrl = kernel.get(MyController);
   *
   *   it("should be ok", async() => {
   *     expect(await ctrl.find()).toBe(...);
   *   });
   * });
   * ```
   *
   * @param store         Store, map of key-value. (env, conf, states, ...)
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
   * Identifier.  (12 random chars)
   * Every fork, new id is based on parent id. (parentId + '.' + 12 random chars)
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
   */
  private store: IStore;

  /**
   * Is Kernel#start called ?
   */
  private started: boolean;

  /**
   * Ref to parent when Kernel#fork().
   */
  private parent?: Kernel;

  private logger: Logger;

  /**
   * Create a new kernel. Use Kernel.create instead.
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
   * - declarations are cloned without instances
   * - store and events are cleared
   *
   * Beware, parent's store is still accessible.
   *
   * ```ts
   * const k = new Kernel({ A: "B", C: "D" });
   * const c = k.fork({A: "F"});
   * c.state("A"); // F
   * c.state("C"); // D
   * ```
   *
   * Fork before an invoke to be a little more safe.
   * ```ts
   * const k = Kernel.create();
   * const app = new Koa();
   * app.use((ctx, next) => {
   *   k.fork().invoke(MyCtrl, "findUsers", [ctx]);
   * });
   * ```
   *
   * @param store     Map of key value
   */
  public fork(store?: IStore): Kernel {
    return new Kernel(store, this);
  }

  // -------------------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------------------

  /**
   * Fluent configuration.
   *
   * ```ts
   * Kernel
   *  .create()
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
   *
   * All onStart() are sorted by link declarations.
   * All onStart() have a access to "this.declarations".
   * All onStart() are **asynchronous**.
   *
   * ```ts
   * class Provider {
   *   onStart(declarations?: IDeclarations) {
   *     throw new Exception("nooo")
   *   }
   * }
   *
   * Kernel
   *   .create()
   *   .with(P)
   *   .start()
   *   .catch(console.error); // Exception nooo
   * ```
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
   * Trigger onStop of each provider.
   *
   * ```
   * const kernel = Kernel.create();
   * kernel.start();
   * process.on('message', function(msg) {
   *   if (msg == 'shutdown') {
   *     console.log('Closing all connections...');
   *     kernel.stop()
   *      .then(() => process.exit();
   *  }
   * });
   * ```
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
   * Chain declarations.
   *
   * ```ts
   * Kernel
   *   .create()
   *   .with(A, B, C, D)
   *   .with(E, F, G, H)
   *   .with(I)
   *   .configure(k => process.env.NODE_ENV === production &&
   *     k.with(J, K)
   *   )
   *   .start();
   * ```
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
   * Alias of Kernel#inject().
   *
   * ```ts
   * const s = Kernel.create().get(Service);
   * ```
   */
  public get<T>(definition: Class<T>): T {
    return this.inject(definition);
  }

  /**
   * Inject a service/provider.
   *
   * ```ts
   * class A { b = "c" }
   * kernel.inject(A).b; // "c"
   * ```
   *
   * ### Parent
   *
   * ```ts
   * Kernel.create().inject(Logger, {parent: B});
   * ```
   *
   * ### Skip registration
   *
   * ```ts
   * const k = Kernel.create();
   *
   * k.inject(A, {register: false}); // just create and process
   * k.inject(A, {instance: a});     // re-use an instance (and skip registration)
   * ```
   *
   * @param definition          Class or {provide: Class, use: Class}
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
   * Getter/Setter of Kernel#store.
   *
   * ```ts
   * kernel.state("A"); // Getter
   * kernel.state("A", "B"); // Setter
   * ```
   *
   * If key doesn't exist on this kernel, we will check on the parent.
   *
   * ```ts
   * const parent = Kernel.create({A: "B"});
   * const child = parent.fork();
   * child.state("A"); // B
   * ```
   *
   * An event is fired on each mutation: `oly:state:mutate`.
   *
   * ```ts
   * Kernel.create().state("A", "B", () => "when IStateMutateEvent is done");
   * ```
   *
   * ### Keyify
   *
   * A key is always converted to /[A-Z_]+/.
   * - "a" -> A
   * - "A.b" -> A_B
   * - "hello-world" -> HELLO_WORLD
   *
   * ```ts
   * const k = Kernel.create({"A.b": "B"})
   * k.state("A_B") === k.state("A.b")
   * ```
   *
   * @param key           Identifier as string who defined the value
   * @param newValue      Optional new value (setter mode)
   * @param callback      Optional callback triggered after the mutation (setter mode)
   */
  public state(key: string, newValue?: any, callback: () => any = () => null): any {

    // identifier is case insensitive
    const identifier = Global.keyify(key);

    if (identifier === "KERNEL_ID") {
      return this.id;
    }

    if (typeof this.store[identifier] !== "undefined" && arguments.length === 1) {
      return this.store[identifier];
    }

    if (this.parent) {
      const parentValue = this.parent.state(identifier);
      if (typeof parentValue !== "undefined") {

        // TODO: disabled by default (and allowed with something like @state({allowCrazyMutateFromBehind: true}))
        if (typeof newValue !== "undefined") {
          return this.parent.state(identifier, newValue);
        }
        return parentValue;
      }
    }

    if (arguments.length === 2) {
      if (this.store[identifier] !== newValue) {
        const event: IStateMutateEvent = {key: identifier, newValue, oldValue: this.store[identifier]};
        this.store[identifier] = newValue;
        this.emit(olyCoreEvents.STATE_MUTATE, event).then(callback);
      }
    }

    return this.store[identifier];
  }

  /**
   * Read-only Kernel#state().<br/>
   *
   * Value can be converted.
   *
   * ```ts
   * kernel = Kernel.create({a: "true", b: "[1, 2, 3]"});
   * kernel.env("a", Boolean); // true
   * kernel.env("b", Array); // [1, 2, 3]
   * ```
   *
   * ### Template
   *
   * ```ts
   * Kernel
   *   .create({a: "${A}.${B}", b: "B", c: "c"})
   *   .env("a"); // B.c
   * ```
   *
   * @param key         Identifier as string who defined the value
   * @param forceType   Convert result on given type when it's possible
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
   *
   * ```ts
   * kernel.on("wat", () => console.log("Hi!"));
   * ```
   *
   * Event can be unique.
   *
   * ```ts
   * kernel.on("watwat", () => console.log("once"), {unique: true});
   * ```
   *
   * A object "Observer" is returned.
   *
   * ```ts
   * const obs = kernel.on("toto");
   * obs.wait() // wait event as promise
   * obs.free() // unsubscribe
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
      kernel: this,
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
   * ```ts
   * kernel.on("my:event", console.log);
   * kernel.emit("my:event", {some: "data"});
   * ```
   *
   * This is asynchronous.
   *
   * ```ts
   * kernel.on("event", () => sleep(1000));
   * kernel.on("event", () => sleep(1000));
   * await kernel.emit("event"); // wait the end of each callback
   * ```
   *
   * Callback results/errors.
   *
   * ```ts
   * kernel.on("test", () => "OK");
   * kernel.on("test", () => { throw new Error("NOK") });
   * const results = await kernel.emit("test");
   * results[0] // "OK" || Error { OK }
   * results[1] // "OK" || Error { OK }
   * ```
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
   * Invoke a function/method of a Class.
   *
   * ```ts
   * class A { b(...args) { console.log(args) } }
   *
   * kernel.invoke(A, "b", ["hello", "world"]);
   * ```
   *
   * Some handlers are executed before the call.
   *
   * ```ts
   * class A { b(@state("X") msg) { console.log(msg) } }
   *
   * Kernel.create({X: "Hi!"}).invoke(A, "b"); // Hi!
   * ```
   *
   * @param definition            Class or Instance, class will be instantiate.
   * @param propertyKey           Name of the method.
   * @param additionalArguments   Add more arguments.
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
   * This will:
   * - remove all unused children and free() events.
   * - free() events.
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
      .map((child) => this.declarations.filter((decl) => decl.definition === child.type)[0])
      .filter((target) =>
        !!target &&
        this.declarations.filter((decl) =>
          !!decl.children.filter((child) => child.type === target.definition)[0],
        ).length <= 1,
      )
      .forEach((target) => this.removeDependency(target));
  }

  /**
   * Process metadata of a Class or a Factory.
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
   * Process instance metadata.
   * - create instance with definition if no instance is provided
   * - process env/state/on and use injections
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

    args.push(this);

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
            configurable: true,
          });
        } else {
          if (typeof this.state(stateName) === "undefined") {
            // when readonly + no default value, env is useless so we throw an error
            // for avoiding this, you need to set env = null
            throw new KernelException(olyCoreErrors.envNotDefined(stateName));
          }
          Object.defineProperty(instance, propertyKey, {
            get: () => this.env(stateName, state.type),
            configurable: true,
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
   * Process injectable({provide: Class}).
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
      this.forceProvideDecorator(definition); // recursive yo
    }
  }

  /**
   * Bubble sort declarations by requirement.
   * Performance disaster.
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
