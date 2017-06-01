import { attachKernel } from "oly-test";
import { FileService } from "../src";
import { WorkspaceProvider } from "../src/WorkspaceProvider";

describe("WorkspaceProvider", () => {
  const kernel = attachKernel({
    WORKSPACE_DIRECTORY: "out",
    WORKSPACE_DIRECTORY_RESET: true,
    WORKSPACE_TMP: "test",
  });
  const workspaceProvider = kernel.get(WorkspaceProvider);
  const fileService = kernel.get(FileService);

  it("should create a file", async () => {
    const content = "Hello!";
    const filepath = workspaceProvider.rand(".txt");
    await fileService.write(filepath, content);
    expect(await fileService.exists(filepath)).toBeTruthy();
    expect(await fileService.read(filepath, {encoding: "UTF-8"})).toBe(content);
    await fileService.remove(filepath);
    expect(await fileService.exists(filepath)).toBeFalsy();
  });
});
