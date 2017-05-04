import { equal } from "assert";
import * as cheerio from "cheerio";
import { IAnyFunction, IClass, inject, Kernel } from "oly-core";
import { HttpClient } from "oly-http";
import * as React from "react";
import { RouterState } from "react-router";
import { attach } from "../../src/core/decorators/attach";
import { page, page404, page500 } from "../../src/router/decorators/page";
import { ReactServerProvider } from "../../src/router/providers/ReactServerProvider";

describe("ReactServerProvider", () => {

  interface IAppTest {
    kernel: Kernel;
    open(url: string): Promise<{
      html: string;
      $: CheerioStatic
    }>;
  }

  const appTestFactory = async (Router: IClass): Promise<IAppTest> => {
    const kernel = new Kernel({
      OLY_HTTP_SERVER_PORT: 6001 + Math.floor(Math.random() * 100),
      OLY_LOGGER_LEVEL: "ERROR",
      OLY_REACT_SERVER_POINTS: ["default"],
    }).with(Router, ReactServerProvider);
    await kernel.start();
    const client = kernel.get(HttpClient).with({baseURL: "http://localhost:" + kernel.env("OLY_HTTP_SERVER_PORT")});
    return {
      kernel,
      open: async (url: string) => {
        const {data} = await client.get<string>(url);
        return {
          $: cheerio.load(data),
          html: data,
        };
      },
    };
  };

  class SuperService {
    data: string;
    getText = () => "about";
    getAsyncText = () => Promise.resolve("home");
    reverseAsync = () => Promise.resolve(this.data.split("").reverse().join(""));
  }

  @attach
  class About extends React.Component<any, any> {

    @inject ss: SuperService;

    render() {
      return (
        <div>{this.ss.getText()}</div>
      );
    }
  }

  class NestedRouter {

    @inject ss: SuperService;

    @page("/") a = () => <div>A</div>;

    @page("/b")
    async b() {
      const text = await this.ss.reverseAsync();
      return ({data}: any) => (
        <div>{data}{text}</div>
      );
    }
  }

  class Router {

    @inject ss: SuperService;

    @page("/", {
      nested: [NestedRouter],
    })
    index = async () => {
      const data = await this.ss.getAsyncText();
      this.ss.data = data;
      return ({children}: any) => (
        <div>
          {data}
          {React.cloneElement(children, {data})}
        </div>
      );
    }

    @page("/about") about = () => About;

    @page("/fail") crazyAction() {
      const wat = true;
      if (wat) {
        throw new Error("LOL");
      }
      return <div>never</div>;
    }

    @page404 notFound() {
      return <div>notFound</div>;
    }

    @page500 errorHandler(state: RouterState, replace: IAnyFunction, error: Error) {
      return <div>snap,{error.message}</div>;
    }
  }

  let app: IAppTest;

  beforeAll(async () => app = await appTestFactory(Router));
  afterAll(async () => await app.kernel.stop());

  it("should render component", async () => {
    const {$} = await app.open("/about");
    equal($('div[id="app"] div').text(), "about");
  });

  it("should render nested view", async () => {
    const {$} = await app.open("/");
    equal($('div[id="app"] div').text(), "homeAA");
    equal($('div[id="app"] div div').text(), "A");
  });

  it("should render nested routing view", async () => {
    const {$} = await app.open("/b");
    equal($('div[id="app"] div').text(), "homehomeemohhomeemoh");
    equal($('div[id="app"] div div').text(), "homeemoh");
  });

  it("should render not-found", async () => {
    const {$} = await app.open("/c");
    equal($('div[id="app"] div').text(), "notFound");
  });

  it("should handle error", async () => {
    const {$} = await app.open("/fail");
    equal($('div[id="app"] div').text(), "snap,LOL");
  });
});
