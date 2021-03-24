import * as fs from "fs";
import { Kernel } from "oly";
import { join } from "path";
import * as requestPromise from "request-promise";
import { ApiProvider, file, IUploadedFile, post } from "../src";

describe("@file", () => {

  class DummyUploadController {
    @post("/mono") mono(@file() f1: IUploadedFile) {
      return {
        f1: f1.size,
      };
    }

    @post("/duo") duo(@file() f1: IUploadedFile, @file() f2: IUploadedFile) {
      return {
        f1: f1.size,
        f2: f2.size,
      };
    }
  }

  const k = Kernel.create({HTTP_SERVER_PORT: 19249}).with(ApiProvider, DummyUploadController);
  const s = k.get(ApiProvider);

  it("should upload one file", async () => {
    const response = await requestPromise({
      method: "POST",
      url: s.hostname + "/mono",
      formData: {
        f1: {
          value: fs.createReadStream(join(__dirname, "dummy.txt")),
          options: {
            filename: "dummy.txt",
            contentType: "text/plain",
          },
        },
      },
    });
    expect(JSON.parse(response)).toEqual({f1: 12});
  });

  it("should upload 2 files", async () => {
    const response = await requestPromise({
      method: "POST",
      url: s.hostname + "/duo",
      formData: {
        f1: {
          value: fs.createReadStream(join(__dirname, "dummy.txt")),
          options: {
            filename: "dummy.txt",
            contentType: "text/plain",
          },
        },
        f2: {
          value: fs.createReadStream(join(__dirname, "dummy2.txt")),
          options: {
            filename: "dummy2.txt",
            contentType: "text/plain",
          },
        },
      },
    });
    expect(JSON.parse(response)).toEqual({f1: 12, f2: 24});
  });
});
