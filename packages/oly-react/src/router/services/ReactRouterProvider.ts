import { _, Class, IDeclarations, inject, IProvider, Kernel, Logger, Meta, state } from "oly-core";
import { createElement } from "react";
import { Layer } from "../components/Layer";
import { olyReactRouterEvents } from "../constants/events";
import { olyReactRouterKeys } from "../constants/keys";
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
} from "../interfaces";
import { Kirk } from "./Kirk";

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
  protected kirk: Kirk;

  public href(query: IHrefQuery | string): string {
    return this.kirk.url(this.routes, query, this.match);
  }

  public async transition(query: string | IHrefQuery): Promise<ITransition> {
    try {

      this.logger.debug(`begin transition`, {query});

      // prepare
      await this.kernel.emit(olyReactRouterEvents.TRANSITION_BEGIN);

      // match
      const current = this.match ? this.match.route.node : undefined;
      const url = this.href(query);
      const match = this.kirk.match(this.routes, url);

      this.logger.trace(`match ${match.route.node.name} -> ${match.path}`);

      const stack = match.route.stack;
      const newLayers: ILayer[] = [];
      const transition: ITransition = {
        type: (typeof query === "object" && query.type) || "PUSH",
        from: this.match,
        to: match,
      };

      // merge
      let newLevel: number = -1;
      for (let i = 0; i < stack.length; i++) {
        if (this.layers[i] && this.layers[i].node === stack[i]) {
          newLayers.push(this.layers[i]);
        } else {
          newLayers.push({
            node: stack[i],
            // resolve
            chunks: await this.resolve(transition, i),
          });
          if (newLevel === -1) {
            newLevel = i;
          }
        }
      }

      // commit
      this.layers = newLayers;
      this.match = match;

      // render
      await this.kernel.emit(olyReactRouterEvents.TRANSITION_RENDER, newLevel);

      // done!
      await this.kernel.emit(olyReactRouterEvents.TRANSITION_END, transition);

      this.logger.debug(`transition is done`);

      return transition;

    } catch (e) {
      this.logger.warn("Transition has failed");
      await this.kernel.emit(olyReactRouterEvents.TRANSITION_ERROR, e);
      throw e;
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

    this.routes = this.kirk.createRoutes(nodes);
    this.routes.forEach((route) => {
      this.logger.debug(`create route ${route.node.name} -> ${route.path} (${route.stack.length})`);
    });
  }

  /**
   *
   * @param transition
   * @param index
   */
  public async resolve(transition: ITransition, index: number): Promise<IChunks> {

    const target = transition.to.route.stack[index].target;
    const propertyKey = transition.to.route.stack[index].propertyKey;

    this.logger.trace("resolve " + _.identity(target, propertyKey));

    let raw = await this.kernel.invoke(target, propertyKey, [transition, index]);

    this.logger.trace("resolve " + _.identity(target, propertyKey) + " OK");

    if (typeof raw === "function") {
      raw = {main: createElement(raw)};
    } else if (typeof raw === "object") {
      if (raw["$$typeof"]) { // tslint:disable-line
        raw = {main: raw};
      } else {
        for (const key of Object.keys(raw)) {
          raw[key] = typeof raw[key] === "function"
            ? createElement(raw[key])
            : raw[key];
        }
      }
    } else {
      raw = {main: createElement("div", {}, raw)};
    }

    for (const key of Object.keys(raw)) {
      raw[key] = createElement(Layer, {id: index + 1}, raw[key]);
    }

    return raw;
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

      let layout;
      for (const propertyKey of keys) {
        const page: IPagesProperty = pagesMetadata.properties[propertyKey];
        if (page.path === ":layout:") {
          layout = page;
          nodes.push({
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
        const parentNode = layout || parent;
        nodes.push({
          name: page.name,
          path: page.path,
          abstract: Array.isArray(page.children) || page.abstract,
          parent: parentNode ? parentNode.name : undefined,
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
