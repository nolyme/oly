import { _, env, inject, Logger } from "oly-core";
import { join, resolve } from "path";
import { FileService } from "./FileService";

/**
 * Provide a safe place to store files
 */
export class WorkspaceProvider {

  /**
   * Workspace directory.
   */
  @env("WORKSPACE_DIRECTORY")
  public readonly directory: string = join(process.cwd(), "workspace");

  /**
   * Temporary directory.
   */
  @env("WORKSPACE_TMP")
  public readonly tmp: string = ".tmp";

  /**
   * Remove workspace on start.
   */
  @env("WORKSPACE_DIRECTORY_RESET")
  public readonly reset: boolean = false;

  @inject
  protected logger: Logger;

  @inject
  protected file: FileService;

  /**
   * Absolute path of tmp directory.
   *
   * @return {string}
   */
  get tmpDirectory() {
    return this.join(this.tmp) + "/";
  }

  /**
   * Get the absolute path of a workspace active.
   *
   * @param filename    Filename or path replace to the workspace
   */
  public join(filename: string): string {
    if (filename[0] === "/") { // already absolute, don't resolve!
      return filename;
    }
    return resolve(this.directory, filename);
  }

  /**
   * Generate a filepath. Useful for temp file or test.
   *
   * @return Random filepath
   */
  public rand(ext = ""): string {
    return resolve(this.tmpDirectory, _.shortid() + ext);
  }

  /**
   *
   */
  public async onStart(): Promise<void> {
    if (this.reset) {
      await this.file.remove(this.directory);
    }
    await this.file.mkdirp(this.directory);
    await this.file.remove(this.tmpDirectory);
    await this.file.mkdirp(this.tmpDirectory);
  }

  /**
   *
   */
  public async onStop(): Promise<void> {
    await this.file.remove(this.tmpDirectory);
    if (this.reset) {
      await this.file.remove(this.directory);
    }
  }
}
