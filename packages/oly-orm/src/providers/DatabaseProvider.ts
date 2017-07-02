import { Class, env, IDeclaration, inject, IProvider, Kernel, Logger, Meta, state } from "oly-core";
import { IFieldsMetadata, olyMapperKeys } from "oly-json";
import {
  Column,
  ColumnOptions,
  Connection,
  createConnection,
  Entity,
  EventSubscriber,
  getMetadataArgsStorage,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TableMetadataArgs } from "typeorm/metadata-args/TableMetadataArgs";
import { parse } from "url";
import { IRepository } from "../interfaces";
import { EverythingSubscriber } from "../services/EverythingSubscriber";

declare module "oly-json/lib/interfaces" {
  interface IField {
    column: ColumnOptions;
  }
}

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

  @inject
  protected subscriber: EverythingSubscriber;

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

    const meta = Meta.of({key: olyMapperKeys.fields, target: entity}).get<IFieldsMetadata>();
    if (meta) {
      const keys = Object.keys(meta.properties);
      for (const propertyKey of keys) {
        const prop = meta.properties[propertyKey];
        const metaType = Meta.of({key: olyMapperKeys.fields, target: prop.type}).get<IFieldsMetadata>();
        if (metaType) {
          const options = prop.column || {type: "json", nullable: !prop.required};
          Column(options)(entity.prototype, propertyKey);
        } else if (propertyKey === "id") {
          meta.properties[propertyKey].required = false;
          PrimaryGeneratedColumn(prop.column || {})(entity.prototype, propertyKey);
        } else {
          const options = prop.column || {type: "json", nullable: !prop.required};
          Column(options)(entity.prototype, propertyKey);
        }
      }
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
    const subscriber = this.createSubscriber();
    return createConnection({
      autoSchemaSync: this.autoSync,
      ...driver,
      subscribers: [subscriber],
      entities,
      logging: {
        logQueries: true,
        logger: (level: string, message: string) => {
          this.logger.trace(`(${level}) ${message}`);
        },
      },
    });
  }

  protected createSubscriber() {
    const subscriber = this.subscriber;

    function Wrapper() {
      return subscriber;
    }

    EventSubscriber()(Wrapper);

    return Wrapper as any;
  }
}
