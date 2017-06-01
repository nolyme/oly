import * as fs from "fs-extra";
import { exists } from "fs-extra";
import { inject, Logger } from "oly-core";

/**
 *
 */
export class FileService {

  public fs = fs;

  @inject
  protected logger: Logger;

  /**
   * Check if file exists.
   *
   * @param filepath    Absolute path
   */
  public async exists(filepath: string): Promise<boolean> {
    this.logger.debug(`exists ${filepath}`);
    return await new Promise<boolean>((resolve) => exists(filepath, resolve));
  }

  /**
   * Read a file.
   *
   * @param filepath     Absolute path
   */
  public async read(filepath: string): Promise<string> {
    this.logger.debug(`read ${filepath}`);
    return await this.fs.readFile(filepath, "UTF-8");
  }

  /**
   * Write a file.
   *
   * @param filepath   Absolute path
   * @param data      Data
   */
  public async write(filepath: string, data: string | Buffer): Promise<void> {
    this.logger.debug(`write ${filepath}`);
    await this.fs.writeFile(filepath, data);
  }

  /**
   * Move a file.
   *
   * @param filepath       Source
   * @param destination   Destination
   */
  public async move(filepath: string, destination: string): Promise<void> {
    this.logger.debug(`move ${filepath} to ${destination}`);
    await this.fs.move(filepath, destination);
  }

  /**
   * Copy a file.
   *
   * @param filepath       Source
   * @param destination   Destination
   */
  public async copy(filepath: string, destination: string): Promise<void> {
    this.logger.debug(`copy ${filepath} to ${destination}`);
    await this.fs.copy(filepath, destination);
  }

  /**
   * Remove directory/file.
   *
   * @param filepath    Absolute path
   */
  public async remove(filepath: string): Promise<void> {
    this.logger.debug(`remove ${filepath}`);
    await this.fs.remove(filepath);
  }

  /**
   * Ensure directory.
   *
   * @param filepath    Absolute path
   */
  public async mkdirp(filepath: string): Promise<void> {
    this.logger.debug(`mkdirp ${filepath}`);
    await this.fs.mkdirp(filepath);
  }
}
