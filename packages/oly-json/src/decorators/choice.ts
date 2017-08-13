import { schema } from "./schema";

/**
 * Experimental.
 */
export const choice = (properties: string[]) => schema((before) => {
  const required = (before.required || []).filter((key) => properties.indexOf(key) === -1);
  return {
    ...before,
    oneOf: [
      ...(before.oneOf || []),
      ...(properties.map((p) => ({
        required: [`${p}`],
      }))),
    ],
    required,
  };
});
