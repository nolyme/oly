import { ObjectID } from "bson";
import { Collection, MongoError } from "mongodb";
import { Class, inject, Logger } from "oly-core";
import { Json } from "oly-json";
import { IDocument, IObjectDocument } from "../interfaces";
import { DatabaseProvider } from "../providers/DatabaseProvider";

export abstract class Repository<T extends IDocument> {

  public static of<T extends IDocument>(type: Class<T>): Class<Repository<T>> {
    return class RepositoryOf extends Repository<T> {
      public type = type;
    };
  }

  public type: Class<T>;

  @inject()
  private databaseProvider: DatabaseProvider;

  @inject()
  private json: Json;

  @inject()
  private logger: Logger;

  /**
   * Get the collection name.
   */
  public get collectionName(): string {
    return this.constructor.name
        .toLowerCase()
        .replace("repository", "")
      + "s";
  }

  /**
   * Get the collection ref.
   */
  public get collection(): Collection {
    return this.databaseProvider.db.collection(this.collectionName);
  }

  /**
   * Insert or Update a document.
   * Accept json/object.
   */
  public async save(raw: Partial<T>): Promise<T> {

    if (raw._id) {

      const id: any = raw._id;
      const v: any = raw._v;

      this.logger.info(`update`, raw);

      await this.beforeUpdate(raw);

      const data = this.in(Object.assign({}, raw, {
        _v: raw._v ? v + 1 : undefined,
      }));

      const result = await this.collection.findOneAndUpdate({_id: this.castId(id), _v: raw._v}, data);

      if (!result.value && raw._v) {
        if (await this.collection.findOne({_id: this.castId(id)})) {
          throw new MongoError(`Version outdated, document has been updated in the meantime`);
        } else {
          throw new MongoError(`Document with id ${raw._id} does not exist`);
        }
      }

      return this.out(result.value);

    } else {

      this.logger.info(`insert`, raw);

      await this.beforeInsert(raw);

      const data = this.in(Object.assign({}, raw, {_v: 1}));

      await this.collection.insertOne(data);

      return data;
    }
  }

  public async findOne(query: object = {}): Promise<T> {
    this.logger.info(`find one`, query);
    return this.out(await this.collection.findOne(query));
  }

  public async find(query: object = {}): Promise<T[]> {
    this.logger.info(`find`, query);
    return (await this.collection.find(query).toArray()).map((i) => this.out(i));
  }

  public castId(id: string | number | ObjectID): ObjectID {
    return new ObjectID(id);
  }

  public in(items: IObjectDocument | IDocument): T {
    if (items._id && items._id instanceof ObjectID) {
      items._id = items._id.toString();
    }
    const obj: any = this.json.build(this.type, items);
    if (obj._id && typeof obj._id === "string") {
      obj._id = this.castId(obj._id);
    }
    return obj;
  }

  public out(items: Partial<T>): T {
    if (items._id && items._id instanceof ObjectID) {
      items._id = items._id.toString();
    }
    return this.json.map(this.type, items);
  }

  public async beforeInsert(document: Partial<T>): Promise<void> {
    //
  }

  public async beforeUpdate(document: Partial<T>): Promise<void> {
    //
  }
}
