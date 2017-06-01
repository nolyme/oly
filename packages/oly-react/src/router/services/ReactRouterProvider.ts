import { $injector, $q, LocationPlugin, services, StateDeclaration, Transition, UIRouter } from "@uirouter/core";
import {
  _,
  Class,
  IArgumentsMetadata,
  IDeclarations,
  inject,
  IProvider,
  Kernel,
  Logger,
  Meta,
  olyCoreKeys,
  state,
} from "oly-core";
import { createElement } from "react";
import { Layer } from "../components/Layer";
import { olyReactRouterEvents } from "../constants/events";
import { olyReactRouterKeys } from "../constants/keys";
import { IChunks, ILayer, IPagesMetadata, IPagesProperty, IRawChunk, IRouteState } from "../interfaces";
import { DefaultNotFound } from "./DefaultNotFound";
import { serverLocationPlugin } from "./MemoryLocation";

export class ReactRouterProvider implements IProvider {

  /**
   * This is the current stack.
   * All resolved components are stored here.
   * On each page update, layers is erased, there is no cache.
   */
  public layers: ILayer[];

  /**
   * Volatile uiRouter instance.
   * This is unique for a kernel instance.
   */
  public uiRouter: UIRouter;

  /**
   * TODO: Find a better way...
   */
  public resolveLevelCounter: number = 0;

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  /**
   * Declarations are cached to the store.
   */
  @state
  protected stateDeclarations: StateDeclaration[];

  /**
   * Start Router5 listener.
   */
  public listen(locationPlugin: ((router: UIRouter) => LocationPlugin) | string) {

    this.uiRouter = new UIRouter();
    this.setHooks();
    this.stateDeclarations.forEach((state) => {
      this.uiRouter.stateRegistry.register({
        ...state,
        resolve: state.resolve || {
          ["oly$" + state.name]: this.createPageResolver(state.data.target, state.data.propertyKey),
        },
      });
    });
    this.uiRouter.urlService.rules.otherwise({state: "404"});

    this.uiRouter.plugin(
      typeof locationPlugin === "string"
        ? serverLocationPlugin(locationPlugin)
        : locationPlugin);

    this.uiRouter.urlService.listen();
    this.uiRouter.urlService.sync();

    return new Promise((resolve, reject) => {
      this.kernel.on(olyReactRouterEvents.TRANSITION_END, resolve);
      this.kernel.on(olyReactRouterEvents.TRANSITION_ERROR, reject);
    });
  }

  /**
   * Create all routes of a definition based on his metadata.
   *
   * @param definition    Annotate class.
   * @param parent
   */
  public register(definition: Class, parent?: IPagesProperty): void {

    const pagesMetadata = Meta.of({key: olyReactRouterKeys.pages, target: definition}).deep<IPagesMetadata>();
    if (pagesMetadata) {
      const keys = Object.keys(pagesMetadata.properties);
      let layout;

      for (const propertyKey of keys) {
        const page: IPagesProperty = pagesMetadata.properties[propertyKey];
        if (page.url === ":layout:") {
          layout = page;
          this.addStateDeclaration(definition, propertyKey, {...page, url: "", abstract: true}, parent);
          break;
        }
      }

      for (const propertyKey of keys) {
        const page: IPagesProperty = pagesMetadata.properties[propertyKey];
        this.addStateDeclaration(definition, propertyKey, page, layout || parent);
        if (Array.isArray(page.children)) {
          for (const child of page.children) {
            this.register(child, page);
          }
        }
      }
    }
  }

  /**
   *
   * @param declarations
   */
  public scan(declarations: IDeclarations): void {

    const pageDeclarations = declarations
      .filter((declaration) => Meta.of({key: olyReactRouterKeys.pages, target: declaration.definition}).has());

    for (const pageDeclaration of pageDeclarations) {
      if (!this.hasParent(pageDeclarations, pageDeclaration.definition)) {
        this.register(pageDeclaration.definition);
      }
    }
  }

  /**
   * Hook - start.
   *
   * @param declarations
   */
  public onStart(declarations: IDeclarations): any {

    this.stateDeclarations = [];
    this.register(DefaultNotFound);
    this.scan(declarations);
  }

  /**
   *
   * @param target
   * @param propertyKey
   * @param meta
   * @param parent
   */
  protected addStateDeclaration(target: Class,
                                propertyKey: string,
                                meta: IPagesProperty,
                                parent?: IPagesProperty): void {

    if (meta.url[0] === ":") {
      return;
    }

    const index = this.stateDeclarations.findIndex((s) => s.name === meta.name);
    if (index > -1) {
      this.logger.debug(`Override route ${meta.url} (${meta.name}) -> ${_.identity(target, propertyKey)}`);
      this.stateDeclarations.splice(index, 1);
    } else {
      this.logger.debug(`Add route ${meta.url} (${meta.name}) -> ${_.identity(target, propertyKey)}`);
    }

    const stateDeclaration: StateDeclaration = {
      name: meta.name,
      parent: parent ? parent.name : undefined,
      data: {
        target,
        propertyKey,
      },
      url: meta.url,
    };

    if (meta.abstract) {
      stateDeclaration.abstract = true;
    }

    const argumentsMetadata = Meta.of({key: olyCoreKeys.arguments, target}).deep<IArgumentsMetadata>();
    if (argumentsMetadata && argumentsMetadata.args[propertyKey]) {
      const queryParams = argumentsMetadata.args[propertyKey]
        ? argumentsMetadata.args[propertyKey].filter((arg) => arg.id === "react:query")
        : [];

      if (queryParams.length > 0 && typeof stateDeclaration.url === "string") {
        for (const qp of queryParams) {
          if (stateDeclaration.url.indexOf("?") > -1) {
            stateDeclaration.url += "&" + qp.name;
          } else {
            stateDeclaration.url += "?" + qp.name;
          }
        }
      }
    }

    this.stateDeclarations.push(stateDeclaration);
  }

  /**
   * Check if definition is a child of someone.
   *
   * @param pageDeclarations      All declarations
   * @param definition            The target
   */
  protected hasParent(pageDeclarations: IDeclarations, definition: Class) {
    return pageDeclarations
      .filter((p) => p.definition !== definition)
      .map((p) => Meta.of({key: olyReactRouterKeys.pages, target: p.definition}).deep<IPagesMetadata>())
      .filter((p) => {
        if (p) {
          const keys = Object.keys(p.properties);
          for (const key of keys) {
            if (Array.isArray(p.properties[key].children) && p.properties[key].children!.indexOf(definition) > -1) {
              return true;
            }
          }
        }
      }).length > 0;
  }

  /**
   * Generate a resolver.
   *
   * @param definition    Class to instantiate
   * @param propertyKey   Property name to call
   */
  protected createPageResolver(definition: Class,
                               propertyKey: string): () => Promise<IChunks> {
    return () => {

      this.logger.trace("resolve " + _.identity(definition, propertyKey));
      return new Promise<IChunks>((resolve) => resolve(this.kernel.invoke(definition, propertyKey, [])))
        .then((rawChunk: IRawChunk) => {

          if (typeof rawChunk === "function") {
            return {main: createElement(rawChunk)};
          }

          if (rawChunk["$$typeof"]) { // tslint:disable-line
            return {main: rawChunk};
          }

          for (const key of Object.keys(rawChunk)) {
            rawChunk[key] = typeof rawChunk[key] === "function"
              ? createElement(rawChunk[key])
              : rawChunk[key];
          }

          return rawChunk;

        })
        .then((chunks: IChunks) => {

          const level = this.resolveLevelCounter += 1;
          for (const key of Object.keys(chunks)) {
            chunks[key] = createElement(Layer, {id: level}, chunks[key]);
          }

          this.logger.trace("resolve " + _.identity(definition, propertyKey) + " OK");
          return chunks;
        });
    };
  }

  /**
   *
   */
  protected setHooks() {

    this.uiRouter.transitionService.onStart({}, (transition) => {

      const from: string = this.getName(transition.$from());
      const to: string = this.getName(transition.$to());

      if (this.resolveLevelCounter > 0 && to !== from) {
        const fromArray = from.split(".");
        const toArray = to.split(".");
        this.resolveLevelCounter = 0;
        while (fromArray[this.resolveLevelCounter] === toArray[this.resolveLevelCounter]) {
          if (this.resolveLevelCounter >= 10) {
            throw new Error("Infinite loop");
          }
          this.resolveLevelCounter += 1;
        }
      }

      return this.onTransitionStart(transition);
    });

    this.uiRouter.transitionService.onSuccess({}, (transition) => {
      return this.onTransitionEnd(transition);
    });

    this.uiRouter.stateService.defaultErrorHandler((error) => {
      this.logger.warn("Transition has failed", error.detail);
      return this.kernel.emit(olyReactRouterEvents.TRANSITION_ERROR, error.detail);
    });
  }

  /**
   * Hook - transition start.
   *
   * @param transition
   */
  protected onTransitionStart(transition: Transition): Promise<void> {
    this.logger.trace("transition start");
    return this.kernel.emit(olyReactRouterEvents.TRANSITION_BEGIN, transition);
  }

  protected getName(state: IRouteState): string {
    let name: string = state.name;
    while (state.parent) {
      state = state.parent;
      if (state.name) {
        name = state.name + "." + name;
      }
    }
    return name;
  }

  /**
   * Hook - transition end.
   *
   * @param transition
   */
  protected onTransitionEnd(transition: Transition): Promise<void> {

    const newLayers: Array<ILayer | null> = transition.getResolveTokens()
      .filter((tk) => typeof tk === "string" && tk.indexOf("oly$") === 0)
      .map((tk) => ({chunks: transition.injector().get(tk)}));

    const count = this.getName(transition.$to()).split(".").length;
    while (newLayers.length < count) {
      newLayers.unshift(null);
    }

    const copy: ILayer[] = [];
    for (let i = 0; i < count; i++) {
      copy.push(newLayers[i] || this.layers[i]);
    }

    this.layers = copy;
    return this.kernel.emit(olyReactRouterEvents.TRANSITION_RENDER).then(() => {
      this.logger.trace(`transition end (layers=${this.layers.length})`);

      return this.kernel.emit(olyReactRouterEvents.TRANSITION_END, transition);
    });
  }
}

// weird things
services.$q = $q;
services.$injector = $injector;
