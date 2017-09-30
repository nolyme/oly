import { Db, MongoClient } from "mongodb";
import { Class, env, IDeclarations, inject, IProvider, Kernel, Logger, Meta, state } from "oly";
import { olyMongoKeys } from "../constants/keys";
import { IIndexesMetadata } from "../interfaces";

export class DatabaseProvider implements IProvider {

  /**
   * Mongodb URI.
   */
  @env("DATABASE_URL")
  public readonly url: string = "mongodb://localhost/test";

  @state
  public db: Db;

  @inject
  private kernel: Kernel;

  @inject
  private logger: Logger;

  public async onStart(deps: IDeclarations) {

    const url =
      this.url.indexOf("mongodb://") === 0
        ? this.url
        : "mongodb://" + this.url;

    this.db = await MongoClient.connect(url);

    this.logger.info(`connected to ${this.url}`);

    for (const dep of deps) {
      if (dep.instance
        && dep.instance.collectionName
        && dep.instance.type
      ) {
        await this.index(dep.instance.collectionName, dep.instance.type);
      }
    }
  }

  public async onStop() {
    await this.db.close();
  }

  public async index(collectionName: string, type: Class) {
    const meta = Meta.of({target: type, key: olyMongoKeys.indexes}).get<IIndexesMetadata>();
    if (!meta) {
      return;
    }
    const keys = Object.keys(meta.properties);
    for (const key of keys) {
      if (meta.properties[key].text) {
        await this.db.collection(collectionName).createIndex({[key]: "text"}, {
          unique: meta.properties[key].unique,
        });
      } else {
        await this.db.collection(collectionName).createIndex(key, {
          unique: meta.properties[key].unique,
        });
      }
    }
  }
}
