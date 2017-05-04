import { copy, ensureDir, exists, move, readFile, remove, writeFile } from "fs-promise";
import { dirname } from "path";

/**
 *
 */
export class FileService {

  /**
   * Check if file exists.
   *
   * @param filepath    Absolute path
   */
  public async exists(filepath: string): Promise<boolean> {
    return await exists(filepath);
  }

  /**
   * Read a file.
   *
   * @param filepath    Absolute path
   * @param options     Encoding and flag
   */
  public async read(filepath: string, options: { encoding: "UTF-8"; flag?: string; }): Promise<string>;
  public async read(filepath: string, options: { encoding: string; flag?: string; }): Promise<string | Buffer> {
    return await readFile(filepath, options);
  }

  /**
   * Write a file.
   *
   * @param filepath  Absolute path
   * @param data      Data
   * @param options   Encode, mode and flag
   */
  public async write(filepath: string,
                     data: string | Buffer,
                     options: { encoding: string; mode?: string | number; flag?: string; }): Promise<void> {
    await writeFile(filepath, data, options);
  }

  /**
   * Move a file.
   *
   * @param filepath      Source
   * @param destination   Destination
   */
  public async move(filepath: string, destination: string) {
    return await move(filepath, destination);
  }

  /**
   * Copy a file.
   *
   * @param filepath      Source
   * @param destination   Destination
   */
  public async copy(filepath: string, destination: string) {
    return await copy(filepath, destination);
  }

  /**
   * Remove directory/file.
   *
   * @param filepath Absolute path
   */
  public async remove(filepath: string) {
    return await remove(filepath);
  }

  /**
   * Ensure directory.
   *
   * @param filepath Absolute path
   */
  public async ensureDirectory(filepath: string) {
    return await ensureDir(dirname(filepath));
  }
}
