import { IStore, Kernel } from "oly-core";

export const createKernel = (env: IStore = {}): Kernel => {
  env.OLY_LOGGER_LEVEL = env.OLY_LOGGER_LEVEL || "ERROR";
  return Kernel.create(env);
};

export const attachKernel = (env: IStore = {}): Kernel => {
  env.OLY_LOGGER_LEVEL = env.OLY_LOGGER_LEVEL || "ERROR";
  const kernel = Kernel.create({
    ...env,
    ...process.env,
  });
  beforeAll(() => kernel.start());
  afterAll(() => kernel.stop());
  return kernel;
};
