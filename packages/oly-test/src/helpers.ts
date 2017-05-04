import { IClass, Kernel } from "oly-core";

const setContext = (target: any, kernelInstance?: Kernel) => {
  const kernel = kernelInstance || Kernel.create();
  if (!kernel.env("OLY_LOGGER_LEVEL")) {
    kernel.state("OLY_LOGGER_LEVEL", "ERROR");
  }
  kernel.with(target);
  target.__kernel__ = kernel;
  beforeAll(() => kernel.start());
  afterAll(() => kernel.start());
};

/**
 * Create custom kernel.
 *
 * @param kernel    Kernel to use
 */
export const run = (kernel: Kernel) => (target: IClass) => {
  return setContext(target, kernel);
};

/**
 * Generate "it('message', () => {    })".
 *
 * @param name          Test message
 * @param propertyKey   Internal decorator stuff
 */
export const check = (name?: any, propertyKey?: string): any => {

  const $check = (name1: any) => (target: object, propertyKey2: string) => {
    it(name1 || `#${propertyKey2}()`, async () => {
      const definition = target.constructor as any;
      if (!definition.__kernel__) {
        setContext(definition);
      }
      return await definition.__kernel__.fork().get(definition)[propertyKey2](definition.__kernel__);
    });
  };

  if (propertyKey) {
    return $check(null)(name, propertyKey);
  }

  return $check(name);
};

/**
 * @param name          Test message
 * @param propertyKey   Internal decorator stuff
 */
export const skip = (name?: any, propertyKey?: string): any => {

  const $skip = (name1: any) => (target: object, propertyKey2: string) => {
    xit(name1 || `#${propertyKey2}()`, async () => {
      return null;
    });
  };

  if (propertyKey) {
    return $skip(null)(name, propertyKey);
  }

  return $skip(name);
};

/**
 * @alias
 */
export const test = check;
