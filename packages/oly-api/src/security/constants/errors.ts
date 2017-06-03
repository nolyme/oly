export const olySecurityErrors = {

  tokenExpired: () =>
    `Token has expired`,

  invalidToken: (details: string) =>
    `Invalid token (${details})`,
};
