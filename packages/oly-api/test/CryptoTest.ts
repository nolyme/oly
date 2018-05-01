import { equal, notEqual } from "assert";
import { Kernel } from "oly";
import { Crypto } from "../src";

describe("Crypto", () => {

  describe("#hash()", () => {
    it("should destroy my text", async () => {
      const crypto = Kernel.create().inject(Crypto);
      const password = "azertylol";
      const hash = await crypto.hash(password);
      notEqual(hash, password);
      equal(await crypto.compare(password, hash), true);
    });
  });

  describe("#encrypt()", () => {
    it("should eat my text", async () => {
      const crypto = Kernel.create().inject(Crypto);
      const message = JSON.stringify({user: "tintin", pass: "aPkdo2kdm1ld)"});
      const token = await crypto.encrypt(message);
      notEqual(token, message);
      const result = JSON.parse(await crypto.decrypt(token));
      equal(result.user, "tintin");
    });
  });
});
