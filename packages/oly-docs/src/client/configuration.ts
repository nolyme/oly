import { IStateMutateEvent, Kernel, olyCoreEvents } from "oly";

export const SAVE_STATE = (...states: string[]) => (kernel: Kernel) => {

  const config = JSON.parse(localStorage.getItem("prefs") || "{}");
  const keys = Object.keys(config);
  for (const key of keys) {
    kernel.state(key, config[key]);
  }

  kernel.on(olyCoreEvents.STATE_MUTATE, (ev: any) => {
    if (states.indexOf(ev.key) > -1) {
      config[ev.key] = ev.newValue;
      localStorage.setItem("prefs", JSON.stringify(config));
    }
  });
};
