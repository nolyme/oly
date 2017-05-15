import { createMemoryHistory } from "history";
import { CommonUtil as _, IAnyFunction, IClass, IDeclarations, inject, Kernel, Logger, MetadataUtil } from "oly-core";
import { browserHistory, EnterHook, PlainRoute, RouterState } from "react-router";
import { lyPages } from "../constants";
import { IPageDefinition, IPages, IRouteResolver } from "../interfaces";
import { Browser } from "./Browser";
import { Router } from "./Router";
import { RouterHooks } from "./RouterHooks";

/**
 * Utils for transform @page to <Route/> (react-router v3).
 *
 * This is very messy and not optimized!
 *
 * TODO: migrate to ReactRouterv4 (or ui-router???) and rewrite this file
 */
export class RouterBuilder {

  @inject(Logger)
  protected logger: Logger;

  @inject(RouterHooks)
  protected hooks: RouterHooks;

  @inject(Browser)
  protected browser: Browser;

  /**
   * Create pages from dependencies then build routes.
   *
   * @param dependencies
   * @param kernel
   * @returns {PlainRoute}
   */
  public createRoutesFromDeps(dependencies: IDeclarations, kernel: Kernel): PlainRoute {
    return this.createRoutesFromPages(this.createPages(dependencies.map((d) => d.definition)), kernel);
  }

  /**
   * i have no idea what i'm doing
   *
   * @param definitions   our targets
   */
  public createPages(definitions: IClass[]): IPageDefinition[] {

    // get children based on IPage options as OBJECT (propertyKey as index)
    // -> default behavior
    const getChildren = (pages: IPages): { [key: string]: IPageDefinition[] } =>
      Object.keys(pages)
        .map((key) => ({key, page: pages[key]}))
        .filter(({page}) => !!page.options && !!page.options.children)
        .reduce((children, {key, page}) => {
          if (!!page.options && !!page.options.children) {
            children[key] = this.createPages(page.options.children);
          }
          return children;
        }, {});

    // get children based on IPage options as LIST
    // -> easiest way to find children
    const getChildrenAsList = (pages: IPages): IPageDefinition[] =>
      Object.keys(pages)
        .map((key) => pages[key])
        .filter((page) => !!page.options && !!page.options.children)
        .reduce<IPageDefinition[]>((children, page) => {
          if (page.options && page.options.children) {
            return children.concat(this.createPages(page.options.children));
          }
          return children;
        }, []);

    // extract only valid definitions (react router only)
    const pageDefinitions = definitions
      .filter((definition) => definition && MetadataUtil.has(lyPages, definition))
      .map((definition) => ({
        pages: MetadataUtil.deep(lyPages, definition),
        target: definition,
      }));

    // check if page definition is a child
    // -> children definitions are ignored because they will be injected by their parent
    const isChild = (target: IClass) => pageDefinitions
      .some((pd) => getChildrenAsList(pd.pages)
        .map((pd2) => pd2.target)
        .indexOf(target) > -1);

    return pageDefinitions
      .filter((pd) => !isChild(pd.target))
      .map((pd) => ({
        children: getChildren(pd.pages),
        pages: pd.pages,
        target: pd.target,
      }));
  }

  /**
   * Recursive route building.
   *
   * @param pages   Our pages.
   * @param kernel  Context of instantiation.
   */
  public createRoutesFromPages(pages: IPageDefinition[], kernel: Kernel): PlainRoute {
    return {
      childRoutes: pages.reduce<PlainRoute[]>((routes, page) =>
        routes.concat(this.buildRoutes(page, {kernel, path: "~"})), []),
    };
  }

  /**
   * Create <Route/> based on page definition.
   *
   * @param pageDef     Definition.
   * @param parent      The <Route/> parent as resolver.
   */
  protected buildRoutes(pageDef: IPageDefinition, parent: IRouteResolver): PlainRoute[] {

    const routes: PlainRoute[] = [];

    // @pageLayout feature
    // => create a pageDef child with other pages
    for (const propertyKey of Object.keys(pageDef.pages)) {
      const page = pageDef.pages[propertyKey];
      if (page.url === ":layout:") {                              // check if :layout: exists
        pageDef.children[propertyKey] = [{                        // create new pageDef as child of pageDef layout
          children: pageDef.children,                             // -> same children
          pages: Object.keys(pageDef.pages)                       // -> same pages except layout
            .filter((k) => k !== propertyKey)
            .reduce((o, k) => (o[k] = pageDef.pages[k], o), {}),
          target: pageDef.target,                                 // -> same target
        }];
        pageDef.pages = {};
        pageDef.pages[propertyKey] = {
          args: page.args,
          options: page.options,
          url: "/",
        };
        const route = this.buildPlainRoute(propertyKey, pageDef, parent);
        if (!!route) {
          return [route];
        }
      }
    }

    for (const propertyKey of Object.keys(pageDef.pages)) {
      const route = this.buildPlainRoute(propertyKey, pageDef, parent);
      if (!!route) {
        routes.push(route);
      }
    }

    return routes;
  }

  /**
   *
   * @param propertyKey
   * @param pageDef
   * @param parent
   * @return {any}
   */
  protected buildPlainRoute(propertyKey: string,
                            pageDef: IPageDefinition,
                            parent: IRouteResolver): PlainRoute | null {
    const page = pageDef.pages[propertyKey];

    page.options = page.options || {};
    page.options.data = page.options.data || {};

    // @page500 feature
    if (page.url === ":error:") {
      this.logger.debug(`mount error handler -> ${pageDef.target.name}#${propertyKey}()`);
      this.hooks.errorHandler = (args) => {
        const ctrl = parent.kernel.get(pageDef.target);
        const componentAsync = ctrl[propertyKey].apply(ctrl, args);
        return !!componentAsync.then ? componentAsync : Promise.resolve(componentAsync);
      };
      return null;
    }

    // each route has his own resolver
    const resolver: IRouteResolver = {
      page,
      parent,
      kernel: parent.kernel,
      path: (parent.path + "/" + page.url).replace(/\/\//g, "/"),
    };

    // build route
    const route: PlainRoute = _.assign({}, page.options.data, {
      getComponent: this.getComponentFactory(resolver),
      onChange: page.options.onChange,
      onEnter: this.onEnterFactory(pageDef.target, propertyKey, resolver),
      onLeave: page.options.onLeave,
      path: page.url,
    });

    // show mounted route
    this.logger.debug(`mount ${resolver.path} -> ${pageDef.target.name}#${propertyKey}()`);

    // parse children
    // <Route>
    //   <Route/>   <-- Child
    // </Route>
    if (Array.isArray(pageDef.children[propertyKey])) {

      // build child-routes
      route.childRoutes = pageDef.children[propertyKey]
        .reduce<PlainRoute[]>((routes, pageDef2) =>
          routes.concat(this.buildRoutes(pageDef2, resolver)), []);

      // check/find <Index/> component
      route.childRoutes
        .filter((r) => r.path === "/")
        .forEach((r) => {
          delete r.path;
          route.indexRoute = r;
          if (route.childRoutes) {
            route.childRoutes.splice(route.childRoutes.indexOf(r), 1);
          }
        });

      // remove redundant '/' path
      route.childRoutes
        .filter((r) => !!r.path && r.path.indexOf("/") === 0)
        .forEach((r) => {
          if (r.path) {
            r.path = r.path.slice(1);
          }
        });
    }

    return route;
  }

  /**
   * react-router event "onEnter"
   * ---> feed the resolver
   */
  protected onEnterFactory(definition: IClass, propertyKey: string, resolver: IRouteResolver): EnterHook {
    return (nextState: RouterState, replace, next) => {

      this.hooks.$start(nextState);

      const cb = next || _.noop;
      return Promise.resolve()
        .then(() => {
          const ctrl = resolver.kernel.get(definition);
          const router = resolver.kernel.get(Router);
          const logger = resolver.kernel.get(Logger).as("ReactRouter");

          // HACK: create a fake router during if reactRouter is undefined
          if (!router.history) {
            const history = browserHistory || createMemoryHistory(nextState) as any;
            router.history = {
              ...history,
              ...nextState,
              replace,
              isActive: _.noop as any,
              setRouteLeaveHook: _.noop as any,
              volatile: true,
            };
          }

          const args = [];

          if (resolver.page && Array.isArray(resolver.page.args)) {
            for (const arg of resolver.page.args) {
              if (arg.path) {
                args.push(nextState.params[arg.path]);
              } else if (arg.query) {
                args.push(nextState.location.query[arg.query]);
              }
            }
          }

          const componentAsync = ctrl[propertyKey].apply(ctrl, args);
          const isPromise = !!componentAsync.then;
          const promise = isPromise ? componentAsync : Promise.resolve(componentAsync);
          logger.trace(`resolve ${resolver.path}`);
          return promise;
        })
        .then((result) => {
          resolver.component = result;
          cb();
        })
        .catch((error) => {
          if (!!this.hooks.errorHandler && !!resolver.parent) {
            this.hooks.errorHandler([nextState, replace, error, resolver.parent.component]).then((result) => {
              resolver.component = result;
              cb();
            }).catch((error2) => {
              cb(resolver.error = error2);
            });
          } else {
            cb(resolver.error = error);
          }
        });
    };
  }

  /**
   * react-router event "getComponent"
   * ---> consume the resolver
   */
  protected getComponentFactory(resolver: IRouteResolver): IAnyFunction {
    return (nextState: RouterState, cb: IAnyFunction) => {
      try {
        if (!!resolver.component) {

          // use component directly OR make a stateless component with JSX
          //
          // you can do now:
          // - page1 = () => <h1></h1>
          // - page2 = () => MyComponent
          // - page3 = () => <MyComponent/> # yes, but bad idea
          const Component: any = typeof resolver.component !== "function"
            ? () => resolver.component
            : resolver.component;

          this.hooks.$end(nextState);
          cb(null, Component);

        } else if (!!resolver.error) {

          this.hooks.$end(nextState);
          cb(resolver.error);

        }
      } catch (e) {
        // if user creates stupid hooks
        cb(e);
      }
    };
  }
}
