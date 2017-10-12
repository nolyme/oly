import { Class, inject } from "oly";
import { EntityManager, QueryRunner, Repository as TypeRepository } from "typeorm";
import { DeepPartial } from "typeorm/common/DeepPartial";
import { EntityMetadata } from "typeorm/metadata/EntityMetadata";
import { IRepository } from "../interfaces";
import { DatabaseProvider } from "../providers/DatabaseProvider";

/**
 *
 */
export abstract class Repository<T> extends TypeRepository<T> implements IRepository<T> {

  public static of<T>(entityType: Class<T>): Class<Repository<T>> {
    return class extends Repository<T> {  // tslint:disable-line
      public readonly entityType = entityType;
    };
  }

  public readonly entityType: Class<T>;

  @inject
  protected databaseProvider: DatabaseProvider;

  // ~ TypeORM dependencies ~

  get manager(): EntityManager {
    return this.databaseProvider.connection.getRepository(this.entityType)["manager"];
  }

  get metadata(): EntityMetadata {
    return this.databaseProvider.connection.getRepository(this.entityType)["metadata"];
  }

  get queryRunner(): QueryRunner | undefined {
    return this.databaseProvider.connection.getRepository(this.entityType)["queryRunner"];
  }

  get target() {
    return this.entityType;
  }

  //

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
  public findOneBy(key: string, value: string): Promise<T | undefined> {
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
  public insert(data: Array<DeepPartial<T>>): Promise<T[]>;
  public insert(data: DeepPartial<T>): Promise<T>;
  public insert(data: any): Promise<any> {
    return this.save(this.create(data));
  }
}
