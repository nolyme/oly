import { mkdirp, remove } from "fs-promise";
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

  /**
   *
   */
  @inject(Logger)
  protected logger: Logger;

  /**
   *
   */
  @inject(FileService)
  protected file: FileService;

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
    return this.join(resolve(this.tmp, _.shortid() + ext));
  }

  /**
   *
   */
  protected async onStart(): Promise<void> {
    if (this.reset) {
      await remove(this.directory);
    }
    await mkdirp(this.directory);
    await remove(this.join(this.tmp));
    await mkdirp(this.join(this.tmp));
  }

  /**
   *
   */
  protected async onStop(): Promise<void> {
    await remove(this.join(this.tmp));
  }
}
