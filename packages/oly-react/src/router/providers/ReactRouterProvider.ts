import { Class, Exception, IDeclarations, inject, IProvider, Kernel, Logger, Meta, state } from "oly-core";
import { olyReactRouterEvents } from "../constants/events";
import { olyReactRouterKeys } from "../constants/keys";
import {
  IHrefQuery,
  ILayer,
  IMatch,
  INode,
  IPagesMetadata,
  IPagesProperty,
  IRoute,
  ITransition,
  ITransitionError,
} from "../interfaces";
import { DefaultErrorHandler } from "../services/DefaultErrorHandler";
import { ReactRouterMatcher } from "../services/ReactRouterMatcher";
import { ReactRouterResolver } from "../services/ReactRouterResolver";

export class ReactRouterProvider implements IProvider {

  /**
   * This is the current stack.
   * All resolved components are stored here.
   * On each page update, layers is erased, there is no cache.
   */
  public layers: ILayer[] = [];

  public match?: IMatch;

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  @state
  protected routes: IRoute[];

  @inject
  protected matcher: ReactRouterMatcher;

  @inject
  protected resolver: ReactRouterResolver;

  public href(query: IHrefQuery | string): string | undefined {
    return this.matcher.href(this.routes, query, this.match);
  }

  public async transition(query: string | IHrefQuery): Promise<ITransition | undefined> {

    const options = typeof query === "string" ? { to: query } : query;

    // convert the "query" to a valid url
    const href = this.href(options);
    if (!href) {
      throw new Exception(`Can't find href of '${options.to}'`);
    }

    const match = this.matcher.match(this.routes, href);
    const transition: ITransition = {
      type: options.type || "PUSH",
      from: this.match,
      to: match,
    };

    // now, we are safe, TRANSITION CAN BEGIN!
    this.logger.info(`begin transition -> ${transition.type} ${match.route.node.name}`);
    await this.kernel.emit(olyReactRouterEvents.TRANSITION_BEGIN);

    try {

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
          newLayers.push(this.layers[i]);
        } else {
          const chunks = await this.resolver.resolve(transition, i);
          if (chunks) {
            newLayers.push({
              node: stack[i],
              // resolve
              chunks,
            });
            if (newLevel === -1) {
              newLevel = i;
            }
          } else {
            this.logger.info(`transition is aborted, layer ${i} has return no chunks`);
            await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, transition);
            return;
          }
        }
      }

      if (newLevel === -1) {
        this.logger.info(`transition is aborted, nothing to update`);
        await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, transition);
        return;
      }

      this.layers = newLayers;
      this.match = match;
      await this.kernel.emit(olyReactRouterEvents.TRANSITION_RENDER, {
        transition,
        level: newLevel,
      });
      await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, transition);
      this.logger.info(`transition is done`);
      return transition;

    } catch (error) {

      this.logger.warn(`transition to '${options.to}' has failed`);

      const errorHandler = this.routes.find((r) => r.name === "error") as IRoute;
      const errorTransition: ITransitionError = {
        ...transition,
        to: {
          ...transition.to,
          route: errorHandler,
        },
        error,
      };

      const chunks = await this.resolver.resolve(errorTransition, 0);
      if (chunks) {
        this.layers = [{ node: errorHandler.node, chunks }];
        await this.kernel.emit(olyReactRouterEvents.TRANSITION_RENDER, {
          transition: errorTransition,
          level: 0,
        });
      }

      await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, errorTransition);
    }
  }

  /**
   *
   * @param declarations
   */
  public scan(declarations: IDeclarations): void {
    this.logger.info("scan dependencies");

    const nodes: INode[] = [];
    const pageDeclarations = declarations.filter((declaration) =>
      Meta.of({ key: olyReactRouterKeys.pages, target: declaration.definition }).has());

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
    const pagesMetadata = Meta.of({ key: olyReactRouterKeys.pages, target }).deep<IPagesMetadata>();
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
   * Very tiny object comparator.
   * Used to check the equality of two node params.
   *
   * @protected
   * @param {object} obj1
   * @param {object} obj2
   * @returns {boolean}
   *
   * @memberof ReactRouterProvider
   */
  protected isEqualParams(obj1: object, obj2: object): boolean {
    const keys = Object.keys(obj1);
    for (const key of keys) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
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
      .map((p) => Meta.of({ key: olyReactRouterKeys.pages, target: p.definition }).deep<IPagesMetadata>())
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
