import { Class, inject } from "oly";
import { EntityManager, QueryRunner, Repository as TypeRepository } from "typeorm";
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

  protected get manager(): EntityManager {
    return this.databaseProvider.connection.getRepository(this.entityType)["manager"];
  }

  protected get metadata(): EntityMetadata {
    return this.databaseProvider.connection.getRepository(this.entityType)["metadata"];
  }

  protected get queryRunner(): QueryRunner | undefined {
    return this.databaseProvider.connection.getRepository(this.entityType)["queryRunner"];
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
  public insert(data: object[]): Promise<T[]>;
  public insert(data: object): Promise<T>;
  public insert(data: any): Promise<any> {
    return this.persist(this.create(data));
  }

  /**
   *
   * @param entity
   */
  public onBeforeInsert(entity: T) {
    //
  }

  /**
   *
   * @param entity
   */
  public onBeforeUpdate(entity: T) {
    //
  }

  /**
   *
   * @param entity
   */
  public onBeforeRemove(entity: T) {
    //
  }

  /**
   *
   * @param entity
   */
  public onAfterInsert(entity: T) {
    //
  }

  /**
   *
   * @param entity
   */
  public onAfterUpdate(entity: T) {
    //
  }

  /**
   *
   * @param entity
   */
  public onAfterRemove(entity: T) {
    //
  }

  /**
   *
   * @param entity
   */
  public onAfterLoad(entity: T) {
    //
  }
}
