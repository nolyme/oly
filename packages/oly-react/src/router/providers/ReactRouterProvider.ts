import { Class, env, Exception, IDeclarations, inject, IProvider, Kernel, Logger, Meta, state } from "oly";
import { olyReactRouterEvents } from "../constants/events";
import { olyReactRouterKeys } from "../constants/keys";
import { olyReactRouterStates } from "../constants/states";
import {
  IChunks,
  IHrefQuery,
  ILayer,
  IMatch,
  INode,
  IPagesMetadata,
  IPagesProperty,
  IRoute,
  ITransition,
  ITransitionBeginEvent,
  ITransitionEndEvent,
  ITransitionError,
  ITransitionRenderEvent,
} from "../interfaces";
import { DefaultErrorHandler } from "../services/DefaultErrorHandler";
import { ReactRouterMatcher } from "../services/ReactRouterMatcher";

/**
 * Transform all @page to routes.
 *
 * Public API is available on Router.
 *
 * > Don't use it directly useless you know what you are doing.
 */
export class ReactRouterProvider implements IProvider {

  /**
   * Prefix your react app. It's like API_PREFIX.
   * It's universal:
   * - Browser will use it like a <base href
   * - Server will use koa-mount(prefix).
   */
  @env("REACT_ROUTER_PREFIX")
  public readonly prefix: string = "/";

  /**
   * This is the current stack.
   * All resolved components are stored here.
   * On each page update, layers is erased, there is no cache.
   *
   * Idk why layers isn't in the store with match.
   */
  public layers: ILayer[] = [];

  /**
   * Match = "Current Route".
   * Null on the startup.
   * This state is really really important:
   * - EACH component which depends on Router or ReactRouterProvider will watch this state.
   */
  @state(olyReactRouterStates.REACT_ROUTER_PROVIDER_MATCH)
  public match?: IMatch;

  /**
   * Routes are cached in the store. Useful with SSR.
   * Like Database Connection or Http Server, routes are defined only once on the #onStart.
   */
  @state
  protected routes: IRoute[];

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  @inject
  protected matcher: ReactRouterMatcher;

  /**
   * Get the href of routeName/routeQuery/templateUrl.
   *
   * @param query
   * @returns {string|undefined}
   */
  public href(query: IHrefQuery): string | undefined {
    const href = this.matcher.href(this.routes, query, this.match);
    if (href
      && this.prefix !== "/"
      && href.indexOf(this.prefix) !== 0) {
      return this.prefix + href;
    }
    return href;
  }

  /**
   * Start a transition.
   *
   * @param query     Query href
   * @returns         A transition object or nothing if transition was aborted
   */
  public async transition(query: IHrefQuery): Promise<ITransition | undefined> {

    const options = query;

    if (this.prefix !== "/"
      && options.to[0] === "/"
      && options.to.indexOf(this.prefix) === 0) {
      options.to = options.to.replace(this.prefix, "");
    }

    // convert the "query" to a valid url
    const href = this.matcher.href(this.routes, options, this.match);
    if (!href) {
      throw new Exception(`Can't find href of '${options.to}'`);
    }

    /**
     * Matching
     */

    const match = this.matcher.match(this.routes, href);
    if (this.prefix !== "/") {
      match.path = this.prefix + match.path;
    }

    const transition: ITransition = {
      type: options.type || "PUSH",
      from: this.match,
      to: match,
    };

    // now, we are safe, TRANSITION CAN BEGIN!
    this.logger.info(`begin 'to:${match.route.name}' (${transition.type})`);

    // TODO: #abort()
    await this.kernel.emit(olyReactRouterEvents.TRANSITION_BEGIN, {transition} as ITransitionBeginEvent);

    try {

      /**
       * Resolving
       */

      const newLayers: ILayer[] = [];
      const stack = match.route.stack;

      // merge newLayers with oldLayers
      // if it's a new layer, we resolve the node associated
      // resolves can failed, this is the reason of the try/catch

      // keep in memory the first new level layer
      // it's useful for the <View>
      let newLevel: number = -1;
      for (let i = 0; i < stack.length; i++) {

        // we can re-use layer if:
        // 1. we have already a layer at this level
        // 2. the layer node is equal to the new layer node
        // 3. old params equals new params
        if (
          newLevel === -1
          && this.match
          && this.layers[i]
          && this.layers[i].node === stack[i]
          && this.matcher.isEqualMatchLevel(this.match, match, i)) {
          this.logger.trace(`keep layer ${i} (${this.layers[i].node.name})`);
          newLayers.push(this.layers[i]);
        } else {
          this.logger.trace(`create layer ${i}`);

          //
          // start resolve for one layer
          const result = await this.matcher.resolve(transition, i);
          if (result) {

            // check if redirection
            const redirection = result as ITransition;
            const chunks = result as IChunks;
            if (redirection.to && redirection.to.path) {
              this.logger.info(
                `transition 'to:${match.route.name}' is replaced by another one -> layer ${i} created a redirection`);
              await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, {transition} as ITransitionEndEvent);
              return redirection;
            } else {

              // else, push to our layers
              newLayers.push({
                node: stack[i],
                chunks,
              });
              if (newLevel === -1) {
                newLevel = i;
              }
            }
          } else {
            // if nothing was returned
            this.logger.info(
              `transition 'to:${match.route.name}' is aborted -> layer ${i} did not return chunk`);
            await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, {transition} as ITransitionEndEvent);
            return;
          }
        }
      }

      if (newLevel === -1) {
        this.logger.info(`transition 'to:${match.route.name}' is aborted -> nothing to update`);
        await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, {transition} as ITransitionEndEvent);
        return;
      }

      /**
       * Rendering
       */

      const oldLayers = this.layers;
      const oldMatch = this.match;
      this.layers = newLayers;
      this.match = match;

      const errors = await this.kernel.emit(olyReactRouterEvents.TRANSITION_RENDER, {
        transition,
        level: newLevel,
      } as ITransitionRenderEvent);

      for (const error of errors) {
        if (error) {
          // revert
          this.layers = oldLayers;
          this.match = oldMatch;
          throw error;
        }
      }

      /**
       * Epilogue
       */

      await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, {transition} as ITransitionEndEvent);

      this.logger.info(`transition 'to:${match.route.name}' is done`);

      return transition;

    } catch (error) {

      this.logger.warn(`transition 'to:${match.route.name}' has failed`);

      // find an error handler
      const errorHandler = this.routes.filter((r) => r.name === "error")[0] as IRoute;

      // create transition error
      const errorTransition: ITransitionError = {
        ...transition,
        to: {
          ...transition.to,
          route: errorHandler,
        },
        type: "REPLACE",
        error,
      };

      const result = await this.matcher.resolve(errorTransition, 0); // don't catch error !
      if (result) {

        const redirection = result as ITransition;
        const chunks = result as IChunks;

        // catch a redirection
        if (redirection.to && redirection.to.path) {

          await this.kernel.emit(
            olyReactRouterEvents.TRANSITION_END,
            {transition: errorTransition} as ITransitionEndEvent);

          return redirection;
        }

        // else

        this.layers = [{node: errorHandler.node, chunks}];

        await this.kernel.emit(olyReactRouterEvents.TRANSITION_RENDER, {
          transition: errorTransition,
          level: 0,
        });
      }

      await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, {transition: errorTransition} as ITransitionEndEvent);
    }
  }

  /**
   *
   * @param declarations
   */
  public scan(declarations: IDeclarations): void {

    const nodes: INode[] = [];
    const pageDeclarations = declarations.filter((declaration) =>
      Meta.of({key: olyReactRouterKeys.pages, target: declaration.definition}).has());

    for (const pageDeclaration of pageDeclarations) {
      if (!this.hasParent(pageDeclarations, pageDeclaration.definition)) {
        nodes.push(...this.createNodes(pageDeclaration.definition));
      }
    }

    this.routes = this.matcher.createRoutes(nodes.concat(...this.createNodes(DefaultErrorHandler)));
    this.routes.filter((route) => route.regexp).forEach((route) => {
      this.logger.debug(`create route ${route.node.name} -> ${route.path} (${route.stack.length})`);
    });
  }

  /**
   * Hook - start.
   *
   * @param declarations
   */
  public onStart(declarations: IDeclarations): any {
    this.routes = [];
    this.scan(declarations);
  }

  /**
   * Create all routes of a definition based on his metadata.
   *
   * @param target
   * @param parent
   */
  protected createNodes(target: Class, parent?: IPagesProperty): INode[] {

    const nodes: INode[] = [];
    const pagesMetadata = Meta.of({key: olyReactRouterKeys.pages, target}).deep<IPagesMetadata>();
    if (pagesMetadata) {
      const keys = Object.keys(pagesMetadata.properties);

      // handle "layout" use case
      let layout;
      for (const propertyKey of keys) {
        const page: IPagesProperty = pagesMetadata.properties[propertyKey];
        if (page.layout) {
          layout = page;
          nodes.push({
            abstract: true,
            name: page.name,
            path: page.path,
            parent: parent ? parent.name : undefined,
            target,
            propertyKey,
          });
          if (Array.isArray(page.children)) {
            for (const child of page.children) {
              nodes.push(...this.createNodes(child, page));
            }
          }
          break;
        }
      }

      for (const propertyKey of keys) {
        const page: IPagesProperty = pagesMetadata.properties[propertyKey];
        // handle "error" use case
        if (page.name === "error") {
          nodes.push({
            name: page.name,
            path: "",
            abstract: false,
            target,
            propertyKey,
          });
        } else if (!page.layout) {
          const parentNode = layout || parent;
          nodes.push({
            name: page.name,
            path: page.path,
            abstract: Array.isArray(page.children) || page.abstract,
            parent: (parentNode ? parentNode.name : undefined),
            target,
            propertyKey,
          });
          if (Array.isArray(page.children)) {
            for (const child of page.children) {
              nodes.push(...this.createNodes(child, page));
            }
          }
        }
      }
    }

    return nodes;
  }

  /**
   * Check if definition is a child of someone.
   *
   * @param pageDeclarations      All declarations
   * @param definition            The target
   */
  protected hasParent(pageDeclarations: IDeclarations, definition: Class): boolean {
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
}
