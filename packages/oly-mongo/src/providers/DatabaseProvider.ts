import { Db, MongoClient } from "mongodb";
import { Class, env, IDeclarations, inject, IProvider, Kernel, Logger, Meta, state } from "oly-core";
import { olyMongoKeys } from "../constants/keys";
import { IIndexesMetadata } from "../interfaces";

export class DatabaseProvider implements IProvider {

  /**
   * Mongodb URI.
   */
  @env("DATABASE_URL")
  public readonly url: string = "mongodb://localhost";

  @state
  public db: Db;

  @inject
  private kernel: Kernel;

  @inject
  private logger: Logger;

  public async onStart(deps: IDeclarations) {

    this.db = await MongoClient.connect(this.url);

    this.logger.info(`Connected to ${this.url}`);

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
      await this.db.collection(collectionName).createIndex(key, meta.properties[key]);
    }
  }
}
