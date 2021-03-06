import * as cheerio from "cheerio";
import { Class, inject, Kernel } from "oly";
import { HttpClient } from "oly-http";
import * as React from "react";
import { attach } from "../../src/core/decorators/attach";
import { View } from "../../src/router/components/View";
import { page } from "../../src/router/decorators/page";
import { ITransitionError } from "../../src/router/interfaces";
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

  const appTestFactory = async (appy: Class): Promise<IAppTest> => {
    const kernel = new Kernel({
      LOGGER_LEVEL: "ERROR",
      HTTP_SERVER_PORT: 6001 + Math.floor(Math.random() * 100),
      REACT_SERVER_POINTS: ["DEFAULT"],
    }).with(appy, ReactServerProvider);
    const client = kernel.inject(HttpClient).with({
      baseURL: "http://localhost:" + kernel.env("HTTP_SERVER_PORT"),
      validateStatus: () => true,
    });
    await kernel.start();
    return {
      kernel,
      open: async (url: string) => {
        const data = await client.get<string>(url);
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

    @page("/")
    a() {
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

    @page({
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

    @page("/d")
    dumb() {
      throw new Error("boom");
    }

    @page
    error(t: ITransitionError) {
      return <div>{"ERROR:" + t.error.message}</div>;
    }

    @page("/*")
    notFound() {
      return <div>notFound</div>;
    }
  }

  let app: IAppTest;

  beforeAll(async () => app = await appTestFactory(App));
  afterAll(async () => await app.kernel.stop());

  it("should render component", async () => {
    const {$} = await app.open("/about");
    expect($("div[id=\"app\"] div").text()).toBe("about");
  });

  it("should render nested view", async () => {
    const {$} = await app.open("/");
    expect($("div[id=\"app\"] div").text()).toBe("homeAA");
    expect($("div[id=\"app\"] div div").text()).toBe("A");
  });

  it("should render nested routing view", async () => {
    const {$} = await app.open("/b");
    expect($("div[id=\"app\"] div").text()).toBe("homeemohemoh");
    expect($("div[id=\"app\"] div div").text()).toBe("emoh");
  });

  it("should render not-found", async () => {
    const {$} = await app.open("/c");
    expect($("div[id=\"app\"] div").text()).toBe("notFound");
  });

  it("should render error", async () => {
    const {$} = await app.open("/d");
    expect($("div[id=\"app\"] div").text()).toBe("ERROR:boom");
  });
});
