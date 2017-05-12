import { copy, exists, mkdirp, move, readFile, remove, writeFile } from "fs-extra";
import { inject, Logger } from "oly-core";

/**
 *
 */
export class FileService {

  @inject protected logger: Logger;

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
   * @param options     Encoding and flag
   */
  public async read(filepath: string, options: { encoding: "UTF-8"; flag?: string; }): Promise<string>;
  public async read(filepath: string, options: { encoding: string; flag?: string; }): Promise<string | Buffer> {
    this.logger.debug(`read ${filepath}`);
    return await readFile(filepath, options);
  }

  /**
   * Write a file.
   *
   * @param filepath   Absolute path
   * @param data      Data
   * @param options   Encode, mode and flag
   */
  public async write(filepath: string,
                     data: string | Buffer,
                     options: { encoding?: string; mode?: number; flag?: string; } = {}): Promise<void> {
    this.logger.debug(`write ${filepath}`);
    await writeFile(filepath, data);
  }

  /**
   * Move a file.
   *
   * @param filepath       Source
   * @param destination   Destination
   */
  public async move(filepath: string, destination: string) {
    this.logger.debug(`move ${filepath} to ${destination}`);
    return await move(filepath, destination);
  }

  /**
   * Copy a file.
   *
   * @param filepath       Source
   * @param destination   Destination
   */
  public async copy(filepath: string, destination: string) {
    this.logger.debug(`copy ${filepath} to ${destination}`);
    return await copy(filepath, destination);
  }

  /**
   * Remove directory/file.
   *
   * @param filepath    Absolute path
   */
  public async remove(filepath: string) {
    this.logger.debug(`remove ${filepath}`);
    return await remove(filepath);
  }

  /**
   * Ensure directory.
   *
   * @param filepath    Absolute path
   */
  public async mkdirp(filepath: string) {
    this.logger.debug(`mkdirp ${filepath}`);
    return await mkdirp(filepath);
  }
}
