import { FunctionOf, inject, state } from "oly-core";
import { Connection, Repository as TypeRepository } from "typeorm";
import { EntityMetadata } from "typeorm/metadata/EntityMetadata";
import { QueryRunnerProvider } from "typeorm/query-runner/QueryRunnerProvider";
import { DatabaseProvider } from "./DatabaseProvider";

/**
 * Hacky way to #getRepository() with class.
 */
export abstract class Repository<T> extends TypeRepository<T> {

  public static of<T>(type: FunctionOf<T>): FunctionOf<Repository<T>> {
    return class extends Repository<T> {  // tslint:disable-line
      protected type = type;
    };
  }

  @state()
  protected connection: Connection;

  @state()
  protected metadata: EntityMetadata;

  @state()
  protected queryRunnerProvider: QueryRunnerProvider;

  protected type: FunctionOf<T>;

  @inject()
  protected databaseProvider: DatabaseProvider;

  /**
   * Find entities by property.
   *
   * @param key     Name of the property
   * @param value   Value of the property
   */
  public findBy(key: string, value: string): Promise<T[]> {
    return this
      .createQueryBuilder("el")
      .where(`el.${key}=:value`)
      .setParameter("value", value)
      .getMany();
  }

  /**
   * Find entity by property.
   *
   * @param key     Name of the property
   * @param value   Value of the property
   */
  public findOneBy(key: string, value: string): Promise<T> {
    return this
      .createQueryBuilder("el")
      .where(`el.${key}=:value`)
      .setParameter("value", value)
      .getOne();
  }

  /**
   * Create entity and persist.
   *
   * @param data    Json data
   */
  public insert(data: object[]): Promise<T[]>;
  public insert(data: object): Promise<T>;
  public insert(data: any): Promise<any> {
    return this.persist(this.create(data));
  }

  protected onStart(): void {
    const clone = this.databaseProvider.connection.getRepository(this.type) as any;
    this.connection = clone.connection;
    this.metadata = clone.metadata;
    this.queryRunnerProvider = clone.queryRunnerProvider;
  }
}
