/**
 * @jest-environment jsdom
 */

import { _, env, Exception, inject, Kernel, on, state } from "oly";
import * as React from "react";
import { Component } from "react";
import { render } from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { AppContext } from "../../src/core/components/AppContext";
import { autoAttach } from "../../src/core/configuration";
import { olyReactEvents } from "../../src/core/constants/events";
import { action } from "../../src/core/decorators/action";
import { attach } from "../../src/core/decorators/attach";
import { IActionSuccessEvent, IActionErrorEvent } from "../../src/core/interfaces";

describe("AppContext", () => {

  describe("features", () => {

    autoAttach();

    class PersonService {
      createPerson() {
        return {name: "Luc"};
      }
    }

    class GrootException extends Exception {
    }

    @attach
    class A extends Component<any, any> {
      @inject(Kernel) kernel: Kernel;

      @on("plus")
      inc() {
        const counter = this.kernel.state("counter") || 0;
        this.kernel.state("counter", counter + 1);
      }

      render() {
        return (<div id="A">A</div>);
      }
    }

    class B extends Component<any, any> {

      @env("DEFAULT_NAME") defaultName: string;

      @inject kernel: Kernel;

      @inject personService: PersonService;

      @state("person") person: { name: string };

      @state("open") open: boolean;

      @on("rename") renameHandler = (name: string) => this.person = {name};

      @action
      renameAction() {
        return this.person = this.personService.createPerson();
      }

      @action
      async renameActionAsync() {
        await _.timeout(1);
        return this.person = this.personService.createPerson();
      }

      @action
      renameActionLikeACow() {
        throw new GrootException("I am Groot");
      }

      componentWillMount() {
        this.person = {name: this.defaultName};
      }

      render() {
        return (
          <div>
            <button id="btn1" onClick={this.renameAction}>rename</button>
            <button id="btn2" onClick={this.renameActionLikeACow}>rename</button>
            <button id="btn3" onClick={this.renameActionAsync}>rename</button>
            <strong>
              {this.person.name}
            </strong>
            {this.open && <A/>}
          </div>
        );
      }
    }

    const kernel = Kernel.create({DEFAULT_NAME: "Francis"});
    const container = document.createElement("div");
    container.setAttribute("id", "app");
    document.body.appendChild(container);
    const dom = {
      container,
      get: (query: string): HTMLElement => {
        const el = container.querySelector(query);
        if (!el) {
          throw new Error(`Element not found (query='${query}')`);
        }
        return el as HTMLElement;
      },
    };

    beforeEach(() => {
      render(<AppContext kernel={kernel}><B/></AppContext>, dom.container);
    });

    it("componentWillMount can initialize node", () => {
      expect(dom.get("strong").textContent).toBe("Francis");
    });

    it("node mutation update component", async () => {
      kernel.state("person", {name: "Paul"});
      await _.timeout(1);
      expect(dom.get("strong").textContent).toBe("Paul");
    });

    it("action autobind", async () => {
      setTimeout(() => {
        dom.get("#btn1").click();
      });
      const result: IActionSuccessEvent<{ name: string }> = await kernel.on(olyReactEvents.ACTIONS_SUCCESS, _.noop).wait();
      expect(dom.get("strong").textContent).toBe("Luc");
      expect(result.data.name).toEqual("Luc");
    });

    it("kernel emission", async () => {
      await kernel.emit("rename", "Jack");
      expect(dom.get("strong").textContent).toBe("Jack");
    });

    it("kernel __free__", async () => {
      kernel.state("counter", null);
      kernel.state("counter", 0);
      kernel.state("open", null);
      kernel.state("open", true); // mhhhhhhh, we need to do that (no refresh on init)
      await _.timeout(1);
      await kernel.emit("plus");
      expect(dom.container.querySelector("#A")).not.toBeNull();
      expect(kernel.state("counter")).toBe(1);
      kernel.state("open", false);
      await _.timeout(1);
      expect(dom.container.querySelector("#A")).toBeNull();

      // Emitting "plus" here has not effect, no more component are subscribed to this event.
      await kernel.emit("plus");
      expect(kernel.state("counter")).toBe(1);
    });

    it("catch action error", async () => {
      setTimeout(() => {
        dom.get("#btn2").click();
      }, 10);
      const result: IActionErrorEvent = await kernel.on(olyReactEvents.ACTIONS_ERROR, _.noop).wait();
      expect(result.error.message).toBe("I am Groot");
    });

    it("action async", async () => {
      setTimeout(() => {
        dom.get("#btn3").click();
      }, 10);
      const result: IActionSuccessEvent<{ name: string }> = await kernel.on(olyReactEvents.ACTIONS_SUCCESS, _.noop).wait();
      expect(dom.get("strong").textContent).toBe("Luc");
      expect(result.data.name).toEqual("Luc");
    });
  });

  describe("fixes", () => {
    it("should works with extends", () => {

      class D1 {
        data = "O";
      }

      class D2 {
        data = "K";
      }

      class AC extends Component {
        @inject d1: D1;

        render(): JSX.Element | null {
          return null;
        }
      }

      class Aie extends AC {
        componentWillMount() {
          // noop
        }
      }

      class BC extends Aie {
        @inject d2: D2;

        render() {
          return <div>{this.d1.data + this.d2.data}</div>;
        }
      }

      const k1 = Kernel.create();

      expect(renderToStaticMarkup(<AppContext kernel={k1}><BC/></AppContext>))
        .toBe("<div>OK</div>");
    });
  });
});
