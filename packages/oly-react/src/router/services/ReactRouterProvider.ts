import { $injector, $q, LocationPlugin, services, StateDeclaration, Transition, UIRouter } from "@uirouter/core";
import { _, IAnyDefinition, IClass, IDeclarations, inject, Kernel, Logger, MetadataUtil, state } from "oly-core";
import { createElement } from "react";
import { Layer } from "../components/Layer";
import { olyReactEvents } from "../constants/events";
import { lyPages } from "../constants/keys";
import { IChunks, ILayer, IPageMetadata, IPageMetadataMap, IRawChunk, IRouteState } from "../interfaces";
import { DefaultNotFound } from "./DefaultNotFound";

export class ReactRouterProvider {

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

  @inject(Kernel)
  protected kernel: Kernel;

  @inject(Logger)
  protected logger: Logger;

  /**
   * Declarations are cached to the store.
   */
  @state
  protected stateDeclarations: StateDeclaration[];

  /**
   * Start Router5 listener.
   */
  public listen(locationPlugin: (router: UIRouter) => LocationPlugin) {

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

    this.uiRouter.plugin(locationPlugin);

    this.uiRouter.urlService.listen();
    this.uiRouter.urlService.sync();

    return new Promise((resolve, reject) => {
      this.kernel.on(olyReactEvents.TRANSITION_END, resolve);
      this.kernel.on(olyReactEvents.TRANSITION_ERROR, reject);
    });
  }

  /**
   * Create all routes of a definition based on his metadata.
   *
   * @param definition    Annotate class.
   * @param parent
   */
  public register(definition: IClass, parent?: IPageMetadata): void {

    const pages: IPageMetadataMap = MetadataUtil.get(lyPages, definition);
    const layout: IPageMetadata | null = Object.keys(pages)
      .map((key) => pages[key])
      .filter((page) => page.url === ":layout:")[0];

    if (layout) {
      this.addStateDeclaration({...layout, url: "", abstract: true}, parent);
    }

    for (const propertyKey of Object.keys(pages)) {
      const page: IPageMetadata = pages[propertyKey];
      this.addStateDeclaration(page, layout || parent);
      if (Array.isArray(page.children)) {
        for (const child of page.children) {
          this.register(child, page);
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
      .filter((declaration) => MetadataUtil.has(lyPages, declaration.definition));

    for (const pageDeclaration of pageDeclarations) {
      if (!this.hasParent(pageDeclarations, pageDeclaration.definition)) {
        this.register(pageDeclaration.definition);
      }
    }
  }

  /**
   *
   * @param meta
   * @param parent
   */
  protected addStateDeclaration(meta: IPageMetadata, parent?: IPageMetadata): void {

    if (meta.url[0] === ":") {
      return;
    }

    if (meta.name === "404") {
      const item = this.stateDeclarations.filter((s) => s.name === "404")[0];
      if (item) {
        this.stateDeclarations.splice(this.stateDeclarations.indexOf(item), 1);
      }
    }

    this.logger.debug(`Add route ${meta.url} (${meta.name}) -> ${_.targetToString(meta.target, meta.propertyKey)}`);

    const stateDeclaration: StateDeclaration = {
      name: meta.name,
      parent: parent ? parent.name : undefined,
      data: {
        target: meta.target,
        propertyKey: meta.propertyKey,
      },
      url: meta.url,
    };

    if (meta.abstract) {
      stateDeclaration.abstract = true;
    }

    if (meta.args) {
      const queryParams = Array.isArray(meta.args)
        ? meta.args.filter((arg) => arg.type === "query")
        : [];

      if (queryParams.length > 0) {
        stateDeclaration.params = queryParams.reduce((p, arg) => {
          p[arg.name] = null;
          return p;
        }, {});
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
  protected hasParent(pageDeclarations: IDeclarations, definition: IAnyDefinition) {
    return pageDeclarations
        .filter((p) => p.definition !== definition)
        .map((p) => MetadataUtil.get(lyPages, p.definition) as IPageMetadataMap)
        .filter((p) => {
          for (const key of Object.keys(p)) {
            if (Array.isArray(p[key].children) && p[key].children!.indexOf(definition) > -1) {
              return true;
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
  protected createPageResolver(definition: IClass,
                               propertyKey: string): () => Promise<IChunks> {
    return () => {

      this.logger.trace("resolve " + _.targetToString(definition, propertyKey));
      const meta: IPageMetadataMap = MetadataUtil.deep(lyPages, definition);
      const instance = this.kernel.get(definition);
      const params = this.uiRouter.stateService.transition.injector().get("$stateParams");
      const action = instance[propertyKey];
      const args: any[] = Array.isArray(meta[propertyKey].args)
        ? meta[propertyKey].args.map((arg) => params[arg.name])
        : [];

      return new Promise<IChunks>((resolve) => resolve(action.apply(instance, args)))
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

          this.logger.trace("resolve " + _.targetToString(definition, propertyKey) + " OK");
          return chunks;
        });
    };
  }

  /**
   * Hook - start.
   *
   * @param declarations
   */
  protected onStart(declarations: IDeclarations): any {

    this.stateDeclarations = [];
    this.register(DefaultNotFound);
    this.scan(declarations);
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
      return this.kernel.emit(olyReactEvents.TRANSITION_ERROR, error.detail);
    });
  }

  /**
   * Hook - transition start.
   *
   * @param transition
   */
  protected onTransitionStart(transition: Transition): Promise<void> {
    this.logger.trace("transition start");
    return this.kernel.emit(olyReactEvents.TRANSITION_BEGIN, transition);
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
    return this.kernel.emit(olyReactEvents.TRANSITION_RENDER).then(() => {
      this.logger.trace(`transition end (layers=${this.layers.length})`);

      return this.kernel.emit(olyReactEvents.TRANSITION_END, transition);
    });
  }
}

// weird things
services.$q = $q;
services.$injector = $injector;
