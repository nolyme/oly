declare module "oly-core/lib/env" {
  interface IEnv {

    /**
     * Workspace directory.
     *
     * @target    WorkspaceProvider
     * @default   join(process.cwd(), "workspace")
     */
    WORKSPACE_DIRECTORY?: string;

    /**
     * Remove workspace on start.
     *
     * @target    WorkspaceProvider
     * @default   false
     */
    WORKSPACE_DIRECTORY_RESET?: boolean;

    /**
     * Workspace temporary directory.
     *
     * @target    WorkspaceProvider
     * @default   ".tmp"
     */
    WORKSPACE_TMP?: string;
  }
}

export * from "./FileService";
export * from "./WorkspaceProvider";
