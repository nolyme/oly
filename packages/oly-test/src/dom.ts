export const jsdom = require("jsdom"); // tslint:disable-line

export const setEnv = () => {
  const dom = new jsdom.JSDOM();
  const glo: any = global;
  glo.window = dom.window;
  glo.document = dom.window.document;
};

export const createDOM = (mountId = "app") => {
  if (typeof document === "undefined") {
    setEnv();
  }
  const container = document.createElement("div");
  container.setAttribute("id", mountId);
  document.body.appendChild(container);
  return {
    document,
    container,
    get: (query: string): HTMLElement => {
      const el = container.querySelector(query);
      if (!el) {
        throw new Error(`Element not found (query='${query}')`);
      }
      return el as HTMLElement;
    },
  };
};

export const el = () => {

};
