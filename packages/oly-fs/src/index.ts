/**
 *
 */
declare module "oly-core/lib/env" {
  interface IEnv {
    /**
     *
     */
    WORKSPACE_DIRECTORY?: string;
    /**
     *
     */
    WORKSPACE_DIRECTORY_RESET?: boolean;
    /**
     *
     */
    WORKSPACE_TMP?: string;
  }
}

export * from "./FileService";
export * from "./WorkspaceProvider";
