import { inject } from "oly-core";
import { check, run } from "oly-test";
import { FileService } from "../src/FileService";
import { WorkspaceProvider } from "../src/WorkspaceProvider";

@run({
  WORKSPACE_DIRECTORY: "out",
  WORKSPACE_DIRECTORY_RESET: true,
  WORKSPACE_TMP: "test",
})
export class WorkspaceProviderTest {

  @inject workspace: WorkspaceProvider;
  @inject file: FileService;

  @check
  async create() {
    const content = "Hello!";
    const filepath = this.workspace.rand(".txt");
    await this.file.write(filepath, content);
    expect(await this.file.exists(filepath)).toBeTruthy();
    expect(await this.file.read(filepath, {encoding: "UTF-8"})).toBe(content);
    await this.file.remove(filepath);
    expect(await this.file.exists(filepath)).toBeFalsy();
  }
}
