import { Class, env, IDeclaration, inject, IProvider, Kernel, Logger, state } from "oly";
import { Connection, createConnection, Entity, getMetadataArgsStorage } from "typeorm";
import { TableMetadataArgs } from "typeorm/metadata-args/TableMetadataArgs";
import { parse } from "url";
import { IRepository } from "../interfaces";

/**
 * TypeORM connection provider.
 *
 * ```ts
 *  class MyDatabaseProvider extends DatabaseProvider {
 *
 *    createConnection(entities) {
 *      return {
 *        entities,
 *        // ...
 *      };
 *    }
 *  }
 *
 *  Kernel
 *    .create()
 *    .with({provide: DatabaseProvider, use: MyDatabaseProvider});
 * ```
 */
export class DatabaseProvider implements IProvider {

  @env("DATABASE_URL")
  public url: string = ":memory:";

  @env("DATABASE_AUTO_SYNC")
  public autoSync: boolean = true;

  @state
  public connection: Connection;

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  /**
   * Hook - start
   *
   * @param declarations  Kernel dependencies
   */
  public async onStart(declarations: Array<IDeclaration<IRepository>>): Promise<void> {
    this.logger.info(`connect to '${this.url}' ...`);
    const entities = this.getEntities(declarations);
    this.connection = await this.createConnection(entities);
  }

  /**
   * Hook - stop
   */
  public async onStop(): Promise<void> {
    this.logger.info(`close '${this.url}' ...`);
    await this.connection.close();
  }

  /**
   *
   * @param url
   */
  protected getDriver(url: string) {

    if (url === ":memory:") {
      return {
        database: ":memory:",
        type: "sqlite",
      };
    }

    const info = parse(url);
    const proto = info.protocol || "";
    const driver: any = {
      database: (info.path || "test").replace("/", ""),
      password: info.auth ? info.auth.split(":")[1] : "",
      type: proto.replace(":", ""),
      username: info.auth ? info.auth.split(":")[0] : "",
    };

    if (url.indexOf("sqlite") > -1) {
      driver.database = url.replace(/sqlite:\/?/, "");
    } else {
      driver.host = info.hostname;
      driver.port = info.port;
    }

    driver.type = driver.type.replace("postgresql", "postgres");

    return driver;
  }

  /**
   *
   * @param declarations
   */
  protected getEntities(declarations: Array<IDeclaration<IRepository>>): Function[] {

    const tables = getMetadataArgsStorage().tables;
    const entities: Class[] = [];

    for (const d of declarations) {
      if (d.instance && d.instance.entityType) {
        this.logger.debug(`register entity ${d.instance.entityType.name}`);

        entities.push(this.processEntity(tables, d.instance.entityType));
      }
    }

    for (const entity of entities) {
      // ensure all @entity are resolved
      const undeclaredEntities = getMetadataArgsStorage()
        .relations
        .filter((c) => c.target === entity)
        .map((c: any) => c.type())
        .filter((type) => entities.indexOf(type) === -1)
        .map((e) => this.processEntity(tables, e));

      entities.push(...undeclaredEntities);
    }

    return entities;
  }

  /**
   *
   */
  protected processEntity(tables: TableMetadataArgs[],
                          entity: Class): Class {

    // ensure @entity on each Entity
    if (tables.filter((t) => t.target === entity).length === 0) {
      this.logger.trace(`force @Entity() to ${entity.name}`);
      Entity()(entity);
    }

    return entity;
  }

  /**
   * Create a new connection.
   *
   * @param entities  Kernel dependencies
   */
  protected createConnection(entities: Function[]): Promise<Connection> {
    const driver = this.getDriver(this.url);
    return createConnection({
      autoSchemaSync: this.autoSync,
      ...driver,
      entities,
      // TODO: logger
    });
  }
}
