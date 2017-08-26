import { autoAttach } from "./configuration";

export * from "./constants/events";
export * from "./constants/keys";
export * from "./interfaces";
export * from "./decorators/attach";
export * from "./decorators/action";
export * from "./components/AppContext";
export * from "./services/ComponentInjector";

autoAttach();
