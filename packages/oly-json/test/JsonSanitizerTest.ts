import { Kernel } from "oly";
import { JsonSanitizer } from "../src/services/JsonSanitizer";
import { Person } from "./fixtures";

describe("JsonSanitizer", () => {

  const kernel = Kernel.create();
  const sanitizer = kernel.inject(JsonSanitizer);
  const data = JSON.stringify({
    name: "     JeAn      ",
  });

  it("should map", () => {
    const person = sanitizer.sanitizeClass(Person, JSON.parse(data));
    expect(person.name).toBe("JEAN");
  });
});
