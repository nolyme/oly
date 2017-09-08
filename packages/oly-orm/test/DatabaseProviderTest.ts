import { Kernel } from "oly";
import { column, id } from "../src";
import { Repository } from "../src/services/Repository";

describe("DatabaseProvider", () => {

  class Article {
    @id() id: number;
    @column() title: string;
  }

  class ArticleRepository extends Repository.of(Article) {
  }

  const kernel = Kernel.create();
  const repo = kernel.get(ArticleRepository);

  it("should be ok", async () => {
    expect(await repo.count()).toBe(0);
    await repo.insert({title: "Hello"});
    expect(await repo.count()).toBe(1);
    expect(await repo.find().then((list) => list[0].title)).toBe("Hello");
  });
});
