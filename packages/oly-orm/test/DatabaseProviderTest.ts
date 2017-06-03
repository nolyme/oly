import { Kernel } from "oly-core";
import { column, entity, id } from "../src";
import { Repository } from "../src/providers/Repository";

@entity()
class Data {
  @id() id: number;
  @column() name: string;
}

class DataRepository extends Repository.of(Data) {
}

describe("DatabaseProvider", () => {

  const kernel = Kernel.test({
    OLY_DATABASE_URL: ":memory:",
  });
  const dataRepository = kernel.get(DataRepository);

  it("should synchronise schema", async () => {
    expect(await dataRepository.count()).toBe(0);
    await dataRepository.insert({name: "Jean"});
    expect(await dataRepository.count()).toBe(1);
  });
});
