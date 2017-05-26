import { equal } from "assert";
import * as cheerio from "cheerio";
import { IClass, inject, Kernel } from "oly-core";
import { HttpClient } from "oly-http";
import { attach, page, page404 } from "oly-react";
import { View } from "oly-react/lib/router/components/View";
import * as React from "react";
import { ReactServerProvider } from "../../src/server/providers/ReactServerProvider";

interface IAppTest {
  kernel: Kernel;

  open(url: string): Promise<{
    html: string;
    $: CheerioStatic
  }>;
}

class SuperService {
  data: string;
  getText = () => "about";
  getAsyncText = () => Promise.resolve("home");
  reverseAsync = () => Promise.resolve(this.data.split("").reverse().join(""));
}

describe("ReactServerProvider", () => {

  const appTestFactory = async (app: IClass): Promise<IAppTest> => {
    const kernel = new Kernel({
      OLY_HTTP_SERVER_PORT: 6001 + Math.floor(Math.random() * 100),
      OLY_LOGGER_LEVEL: "ERROR",
      OLY_REACT_SERVER_POINTS: ["default"],
    }).with(app, ReactServerProvider);
    const client = kernel.get(HttpClient).with({
      baseURL: "http://localhost:" + kernel.env("OLY_HTTP_SERVER_PORT"),
    });
    await kernel.start();
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

  @attach
  class About extends React.Component<any, any> {

    @inject service: SuperService;

    render() {
      return (
        <div>{this.service.getText()}</div>
      );
    }
  }

  class NestedRouter {

    @inject service: SuperService;

    @page("/") a() {
      return <div>A</div>;
    }

    @page("/b")
    async b() {
      const text = await this.service.reverseAsync();
      return () => (
        <div>{text}</div>
      );
    }
  }

  class App {

    @inject service: SuperService;

    @page("", {
      children: [NestedRouter],
    })
    async index() {
      const data = await this.service.getAsyncText();
      this.service.data = data;
      return () => (
        <div>
          {data}
          <View/>
        </div>
      );
    }

    @page("/about") about = () => About;

    @page404
    notFound() {
      return <div>notFound</div>;
    }
  }

  let app: IAppTest;

  beforeAll(async () => app = await appTestFactory(App));
  afterAll(async () => await app.kernel.stop());

  it("should render component", async () => {
    const {$} = await app.open("/about");
    equal($("div[id=\"app\"] div").text(), "about");
  });

  it("should render nested view", async () => {
    const {$} = await app.open("/");
    equal($("div[id=\"app\"] div").text(), "homeAA");
    equal($("div[id=\"app\"] div div").text(), "A");
  });

  it("should render nested routing view", async () => {
    const {$} = await app.open("/b");
    equal($("div[id=\"app\"] div").text(), "homeemohemoh");
    equal($("div[id=\"app\"] div div").text(), "emoh");
  });

  it("should render not-found", async () => {
    const {$} = await app.open("/c");
    equal($("div[id=\"app\"] div").text(), "notFound");
  });
});
