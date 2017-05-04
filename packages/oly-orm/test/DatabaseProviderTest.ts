import { equal } from "assert";
import { Kernel } from "oly-core";
import { column, entity, id } from "../src";
import { Repository } from "../src/providers/Repository";

describe("DatabaseProvider", () => {

  @entity()
  class Data {
    @id() id: number;
    @column() name: string;
  }

  class DataRepository extends Repository.of(Data) {
  }

  const kernel = new Kernel({
    OLY_DATABASE_URL: ":memory:",
    OLY_LOGGER_LEVEL: "ERROR",
  }).with(DataRepository);

  beforeAll(() => kernel.start());
  afterAll(() => kernel.stop());

  it("should synchronise schema", async () => {
    const dataRepository = kernel.get(DataRepository);
    equal(await dataRepository.count(), 0);
    await dataRepository.insert({name: "Jean"});
    equal(await dataRepository.count(), 1);
  });
});
