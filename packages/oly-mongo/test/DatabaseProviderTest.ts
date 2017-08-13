import { MongoError } from "mongodb";
import { inject, Kernel, Time } from "oly-core";
import { date, field } from "oly-json";
import { index } from "../src/decorators";
import { DatabaseProvider } from "../src/providers/DatabaseProvider";
import { Document } from "../src/services/Document";
import { Repository } from "../src/services/Repository";

describe("DatabaseProvider", () => {

  class Person extends Document {

    @index({unique: true})
    @field
    firstname: string;

    @field
    lastname: string;

    @date
    createdAt: Date;

    get name() {
      return `${this.firstname} ${this.lastname}`;
    }
  }

  class PersonRepository extends Repository.of(Person) {

    @inject()
    private time: Time;

    public async beforeInsert(document: Person): Promise<void> {
      document.createdAt = new Date(this.time.now());
    }
  }

  const kernel = Kernel.create();
  const time = kernel.inject(Time);
  const databaseProvider = kernel.inject(DatabaseProvider);
  const personRepository = kernel.inject(PersonRepository);

  beforeEach(() => personRepository.collection.deleteMany({}));
  afterAll(() => databaseProvider.db.dropDatabase());

  it("should insert data", async () => {

    const r = await personRepository.save({firstname: "John", lastname: "Doe"});
    expect(r.id).toBeDefined();

    const list = await personRepository.find();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe(`John Doe`);
  });

  it("should check unique", async () => {
    await personRepository.save({firstname: "Boom", lastname: "Boom"});
    await expect(personRepository.save({firstname: "Boom", lastname: "Boom"}))
      .rejects
      .toBeInstanceOf(MongoError);
  });

  it("should handle hooks", async () => {
    time.pause();
    await personRepository.save({firstname: "Time", lastname: "Test"});
    const result = await personRepository.findOne({firstname: "Time"});
    expect(result.createdAt).toEqual(new Date(time.now()));
  });

  it("should check update version", async () => {

    await personRepository.save({firstname: "crash", lastname: "test"});

    const v1 = await personRepository.findOne({firstname: "crash"});
    const v1b = await personRepository.findOne({firstname: "crash"});

    expect(v1).toEqual(v1b);

    v1b.lastname = "toto";
    await personRepository.save(v1b);

    v1.lastname = "tata";
    await expect(personRepository.save(v1))
      .rejects
      .toBeInstanceOf(MongoError);
  });
});
