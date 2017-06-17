import { Class, env, IDeclaration, inject, IProvider, Logger, state } from "oly-core";
import { Connection, createConnection, DriverOptions, Entity, getMetadataArgsStorage } from "typeorm";
import { parse } from "url";

/**
 * Typeorm connection manager.
 */
export class DatabaseProvider implements IProvider {

  @env("DATABASE_URL")
  public url: string;

  @env("DATABASE_AUTO_SYNC")
  public autoSync: boolean = true;

  @env("DATABASE_SHOW_LOGS")
  public showLogs: boolean = false;

  @state
  public connection: Connection;

  @inject
  protected logger: Logger;

  /**
   * Hook - start
   *
   * @param deps  Kernel dependencies
   */
  public async onStart(deps: Array<IDeclaration<{ type: Class }>>): Promise<void> {
    this.logger.info(`connect to '${this.url}' ...`);
    this.connection = await this.createConnection(deps);
  }

  /**
   * Hook - stop
   */
  public async onStop(): Promise<void> {
    await this.connection.close();
  }

  /**
   *
   * @param url
   */
  protected getDriver(url: string): DriverOptions {

    if (url === ":memory:") {
      return {
        storage: ":memory:",
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
      driver.storage = url.replace(/sqlite:\/?/, "");
      driver.database = "";
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
  protected getEntities(declarations: Array<IDeclaration<{ type?: Class }>>): Function[] {

    const tables = getMetadataArgsStorage().tables.toArray();
    const entities: Class[] = [];
    for (const d of declarations) {
      if (d.instance && d.instance.type) {
        entities.push(d.instance.type);
      }
    }

    for (const entity of entities) {
      // ensure all @entity are resolved
      const undeclaredEntities = getMetadataArgsStorage()
        .relations
        .filter((c) => c.target === entity)
        .toArray()
        .map((c: any) => c.type())
        .filter((type) => entities.indexOf(type) === -1);

      entities.push(...undeclaredEntities);
    }

    entities.forEach((e) => {
      // ensure @entity on each Entity
      if (tables.filter((t) => t.target === e).length === 0) {
        Entity()(e);
      }
    });

    return entities;
  }

  /**
   * Create a new connection.
   *
   * @param deps  Kernel dependencies
   */
  protected createConnection(deps: Array<IDeclaration<{ type: Class }>>): Promise<Connection> {
    return createConnection({
      autoSchemaSync: this.autoSync,
      driver: this.getDriver(this.url),
      entities: this.getEntities(deps),
      logging: {
        logQueries: this.showLogs,
      },
    });
  }
}
