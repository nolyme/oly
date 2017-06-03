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
import { ReactRouterMatcher } from "./business/ReactRouterMatcher";
import { ReactRouterResolver } from "./business/ReactRouterResolver";
import { DefaultErrorHandler } from "./DefaultErrorHandler";

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

    const options = typeof query === "string" ? {to: query} : query;

    this.logger.debug(`begin transition`, {query});
    await this.kernel.emit(olyReactRouterEvents.TRANSITION_BEGIN);

    // match
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

    this.logger.trace(`match ${options.to} -> ${match.route.node.name}`);

    try {

      const newLayers: ILayer[] = [];
      const stack = transition.to.route.stack;

      // merge
      let newLevel: number = -1;
      for (let i = 0; i < stack.length; i++) {
        if (this.layers[i] && this.layers[i].node === stack[i]) {
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
            this.logger.debug(`transition is aborted, sorry`);
            await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, transition);
            return;
          }
        }
      }

      this.layers = newLayers;
      this.match = match;
      await this.kernel.emit(olyReactRouterEvents.TRANSITION_RENDER, newLevel);
      await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, transition);
      this.logger.debug(`transition is done`);
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
        this.layers = [{node: errorHandler.node, chunks}];
        await this.kernel.emit(olyReactRouterEvents.TRANSITION_RENDER, 0);
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
        if (page.path === ":layout:") {
          layout = page;
          nodes.push({
            abstract: true,
            name: page.name,
            path: "",
            parent: parent ? parent.name : undefined,
            target,
            propertyKey,
          });
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
        } else if (page.path !== ":layout:") {
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
