/**
 * @jest-environment jsdom
 */
import { Global, Kernel, state } from "oly";
import { Component, createElement } from "react";
import { render } from "react-dom";
import { action, AppContext } from "../../src";

describe("@action", () => {
  document.body.innerHTML = "<div id='app'></div>";

  class App extends Component {
    @state counter = 0;

    @action
    async withLock() {
      this.counter += 1;
      await Global.timeout(10);
    }

    @action({lock: false})
    async withoutLock() {
      this.counter += 1;
      await Global.timeout(10);
    }

    render() {
      return null;
    }
  }

  const kernel = Kernel.create();

  it("should lock call", async () => {
    render(createElement(AppContext, {kernel}, createElement(App)), document.getElementById("app"));
    expect(kernel.state("App.counter")).toBe(0);
    kernel.emit("App.withLock");
    kernel.emit("App.withLock");
    kernel.emit("App.withLock");
    expect(kernel.state("App.counter")).toBe(1);
    kernel.emit("App.withoutLock");
    kernel.emit("App.withoutLock");
    kernel.emit("App.withoutLock");
    expect(kernel.state("App.counter")).toBe(4);
  });
});
