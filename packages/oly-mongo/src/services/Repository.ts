import { ObjectID } from "bson";
import { Collection, MongoError } from "mongodb";
import { Class, inject, Logger } from "oly";
import { Json } from "oly-json";
import { MongoException } from "../exceptions/MongoException";
import { AggregationCursorTransform, CursorTransform, IDocument, IObjectDocument } from "../interfaces";
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

      this.logger.debug(`update`, raw);

      raw = this.json.map(this.type, raw);
      if (typeof raw.beforeUpdate === "function") {
        await raw.beforeUpdate();
      }

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

      this.logger.debug(`insert`, raw);

      raw = this.json.map(this.type, raw);
      if (typeof raw.beforeInsert === "function") {
        await raw.beforeInsert();
      }

      await this.beforeInsert(raw);

      const data = this.in(Object.assign({}, raw, {_v: 1}));

      await this.collection.insertOne(data);

      return this.out(data);
    }
  }

  /**
   *
   * @param {Object} query
   * @returns {Promise<T extends IDocument>}
   */
  public async findOne(query: object = {}): Promise<T | undefined> {
    this.logger.debug(`find one`, query);
    const match = await this.collection.findOne(query);
    if (!match) {
      return;
    }
    return this.out(match);
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<T extends IDocument>}
   */
  public async findById(id: string): Promise<T | undefined> {
    return this.findOne({_id: this.castId(id)});
  }

  /**
   *
   * @param {Object} query
   * @param {CursorTransform} cursorTransformer
   * @returns {Promise<T[]>}
   */
  public async find(query: object = {}, cursorTransformer: CursorTransform = (c) => c): Promise<T[]> {
    this.logger.debug(`find`, query);
    const cursor = cursorTransformer(this.collection.find(query));
    return (await cursor.toArray()).map((i: any) => this.out(i));
  }

  /**
   *
   * @param {Object | Object[]} query
   * @param {AggregationCursorTransform} cursorTransformer
   * @returns {Promise<T[]>}
   */
  public async aggregate(query: object | object[] = {},
                         cursorTransformer: AggregationCursorTransform = (c) => c): Promise<T[]> {
    this.logger.debug(`aggregate`, query);
    const cursor = cursorTransformer(this.collection.aggregate(Array.isArray(query) ? query : [query]));
    return (await cursor.toArray()).map((i: any) => this.out(i));
  }

  /**
   * Find one document by id and replace it.
   */
  public async replaceById(id: string, data: Partial<T>): Promise<void> {
    await this.collection.findOneAndReplace({_id: this.castId(id)}, this.in(data));
  }

  /**
   * Count number of matching documents in the db to a query.
   *
   * @param {Object} mongoQuery
   * @returns {Promise<number>}
   */
  public count(mongoQuery: object = {}): Promise<number> {
    return this.collection.count(mongoQuery);
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<void>}
   */
  public async removeById(id: string) {
    await this.collection.findOneAndDelete({
      _id: this.castId(id),
    });
  }

  /**
   *
   * @returns {Promise<void>}
   */
  public async clear() {
    await this.collection.deleteMany({});
  }

  /**
   *
   * @param {string | number | ObjectID} id
   * @returns {ObjectID}
   */
  public castId(id: string | number | ObjectID): ObjectID {
    return new ObjectID(id);
  }

  /**
   *
   * @param {IObjectDocument | IDocument} document
   * @returns {T}
   */
  public in(document: IObjectDocument | IDocument): T {
    if (document._id && document._id instanceof ObjectID) {
      document._id = document._id.toString();
    }
    try {
      const obj: any = this.json.build(this.type, document);
      if (obj._id && typeof obj._id === "string") {
        obj._id = this.castId(obj._id);
      }
      return obj;
    } catch (e) {
      throw new MongoException(e, `Document has been rejected`);
    }
  }

  /**
   *
   * @param {Partial<T extends IDocument>} document
   * @returns {T}
   */
  public out(document: Partial<T>): T {
    if (document._id) {
      document._id = document._id.toString();
    }
    return this.json.map(this.type, document);
  }

  /**
   *
   * @param {Partial<T extends IDocument>} document
   * @returns {Promise<void>}
   */
  public async beforeInsert(document: Partial<T>): Promise<void> {
    //
  }

  /**
   *
   * @param {Partial<T extends IDocument>} document
   * @returns {Promise<void>}
   */
  public async beforeUpdate(document: Partial<T>): Promise<void> {
    //
  }
}
