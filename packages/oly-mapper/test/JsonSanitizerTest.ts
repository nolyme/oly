import { attachKernel } from "oly-test";
import { JsonSanitizer } from "../src/services/JsonSanitizer";
import { Person } from "./fixtures";

describe("JsonSanitizer", () => {

  const kernel = attachKernel();
  const sanitizer = kernel.get(JsonSanitizer);
  const data = JSON.stringify({
    name: "     JeAn      ",
  });

  it("should map", () => {
    const person = sanitizer.sanitizeClass(Person, JSON.parse(data));
    expect(person.name).toBe("JEAN");
  });
});
