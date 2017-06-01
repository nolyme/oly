import { Collection, ObjectID } from "mongodb";
import { Class, inject, Kernel, Logger, Meta } from "oly-core";
import { IFieldsMetadata, JsonService, olyMapperKeys } from "oly-mapper";
import { olyMongoKeys } from "./constants/keys";
import { ID, IDocument, IIndexesMetadata } from "./interfaces";
import { MongoProvider } from "./MongoProvider";

/**
 *
 */
export abstract class Repository<T extends IDocument> {

  public static of<T extends IDocument>(type: Class<T>): Class<Repository<T>> {
    return class extends Repository<T> { // tslint:disable-line
      protected type = type;
    };
  }

  protected type: Class<T>;

  @inject(Kernel)
  protected kernel: Kernel;

  @inject(Logger)
  protected logger: Logger;

  @inject(MongoProvider)
  protected database: MongoProvider;

  @inject(JsonService)
  protected jsonService: JsonService;

  /**
   * Define the collection name.
   *
   * @returns {string}
   */
  public get collectionName(): string {
    if (this.type && typeof this.type.name === "string") {
      return this.type.name.replace("Document", "").toLowerCase() + "s";
    }
    return (this.constructor as any).name.replace("Repository", "").toLowerCase() + "s";
  }

  /**
   * Return the current collection.
   *
   * @returns {Collection}
   */
  public get collection(): Collection {
    return this.database.connection.collection(this.collectionName);
  }

  /**
   * Ensure id is an ObjectID.
   *
   * @param id String or ObjectID to cast
   */
  public objectId(id: ID): ObjectID {
    if (typeof id === "string") {
      try {
        return new ObjectID(id);
      } catch (ignore) {
        const error = new Error("Invalid ObjectID");
        (error as any).status = 400;
        throw error;
      }
    }
    return id;
  }

  /**
   * Convert your JsonData/String to clean ES6 Document.
   * If you pass a string, it will be JSON#parse().
   * If you pass a ES6 Document, it will be cleaned (keep only allowed fields)
   * ObjectId _id will be casted to string.
   *
   * @param object Json data/string or ES6 Document
   */
  public map(object: object | string): T {

    if (typeof object === "string") {
      object = JSON.parse(object);
    }

    if (typeof object["_id"] === "object") { // tslint:disable-line
      object["_id"] = object["_id"].toString(); // tslint:disable-line
    }

    if (this.type) {
      return this.kernel.get(this.type, {instance: this.jsonService.build(this.type, object)}); // tslint:disable-line
    }

    return object as T;
  }

  /**
   * Same as #map(), but for list.
   *
   * @param list Array of json/string
   */
  public mapAll(list: Array<object | string> = []): T[] {
    return list.map((obj) => this.map(obj));
  }

  /**
   * Used just before insert()
   * Force _id to ObjectId
   *
   * @param object json data or es6 document
   */
  public prepare(object: object): T {
    const raw: any = object;
    raw._id = this.objectId(raw._id);
    return raw;
  }

  /**
   * Create/Update an entity
   *
   * @param data JSON or Entity
   */
  public async save(data: object) {

    const document = this.map(data);
    if (document._id) {
      const raw = this.prepare(document);
      this.logger.trace("find one and update", {_id: raw._id});
      await this.collection.findOneAndUpdate({_id: raw._id}, raw);
    } else {
      this.logger.trace("insert new raw");
      const {insertedId} = await this.collection.insertOne(data);
      document._id = insertedId.toString();
    }
    return document;
  }

  /**
   * Remove a document based on es6 document.
   *
   * @param document
   */
  public async remove(document: T): Promise<T> {
    if (document._id) {
      return await this.removeById(document._id);
    }
    return document;
  }

  /**
   *
   */
  public findAll(query: object = {}): Promise<T[]> {
    return this.collection
      .find(query)
      .toArray()
      .then((r) => this.mapAll(r));
  }

  /**
   *
   * @param query
   */
  public async findOne(query: object): Promise<T | null> {
    const [document] = await this.collection
      .find(query)
      .limit(1)
      .toArray();

    if (!!document) {
      return this.map(document);
    }

    return null;
  }

  /**
   * Find a document by id.
   *
   * @param id
   */
  public findById(id: string): Promise<T | null> {
    return this.findOne({_id: this.objectId(id)});
  }

  /**
   * Remove a document by id, returns the erased document if exists.
   *
   * @param id
   */
  public removeById(id: string): Promise<T> {
    return this.collection.findOneAndDelete({_id: this.objectId(id)}).then(({value}) => this.map(value));
  }

  /**
   * Update a document by id.
   *
   * @param id
   * @param object
   */
  public updateById(id: string, object: object | T): Promise<T> {
    return this.collection.findOneAndUpdate({_id: this.objectId(id)},
      this.prepare(this.map(object))).then(({value}) => this.map(value));
  }

  /**
   * Returns collection length.
   *
   * @param query
   */
  public count(query: object = {}): Promise<number> {
    return this.collection.count(query);
  }

  public async clear() {
    await this.collection.deleteMany({});
  }

  /**
   * Ensure indexes.
   */
  public async sync() {

    const syncType = async (target: any, parent = "") => {

      const indexesMetadata = Meta.of({key: olyMongoKeys.indexes, target}).deep<IIndexesMetadata>();
      if (indexesMetadata) {
        const keys = Object.keys(indexesMetadata.properties);
        for (const propertyKey of keys) {
          this.logger.debug(`index ${parent}${propertyKey}`);
          await this.collection.createIndex(parent + propertyKey, indexesMetadata.properties[propertyKey]);
        }
      }

      const fieldsMetadata = Meta.of({key: olyMapperKeys.fields, target}).deep<IFieldsMetadata>();
      if (fieldsMetadata) {
        const keys = Object.keys(fieldsMetadata.properties);
        for (const propertyKey of keys) {
          const field = fieldsMetadata.properties[propertyKey];
          await syncType(field.type, parent + field.name + ".");
        }
      }
    };

    if (this.type) {
      await syncType(this.type);
    }
  }
}
