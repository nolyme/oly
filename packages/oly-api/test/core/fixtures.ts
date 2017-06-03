import { IKoaMiddleware } from "oly-http";
import { array, field } from "oly-json";
import { body } from "../../src/core/decorators/body";
import { del } from "../../src/core/decorators/del";
import { get } from "../../src/core/decorators/get";
import { header } from "../../src/core/decorators/header";
import { param } from "../../src/core/decorators/param";
import { post } from "../../src/core/decorators/post";
import { put } from "../../src/core/decorators/put";
import { query } from "../../src/core/decorators/query";
import { IUploadedFile } from "../../src/core/interfaces";
import { router } from "../../src/router/decorators/router";
import { use } from "../../src/router/decorators/use";

export const dummyMiddleware: IKoaMiddleware = async (ctx, next) => {
  ctx.kernel.state("counter", ctx.kernel.state("counter") + 1);
  await next();
};

export class SubData {
  @field() g: number;
}

export class Data {
  @field() e: string;
  @array({
    of: SubData,
  }) f: SubData[];
}

@router("/")
export class A1 {
  @get("/") get = () => "OK";
  @post("/") post = () => "OKpost";
  @put("/") put = () => "OKput";
  @del("/") del = () => "OKdel";
}

export class A2 {
  @get("/query")
  query(@query("a") a: string) {
    return {a};
  }

  @get("/query/required")
  queryRequired(@query({name: "a", required: true}) a: string) {
    return {a};
  }

  @get("/header")
  header(@header("AuthorizatION") a: string) {
    return {a};
  }

  @get("/path/:id")
  path(@param("id") a: string) {
    return {a};
  }

  @get("/pathAsNumber/:id")
  pathAsNumber(@param id: number) {
    return {a: id};
  }

  @post("/body")
  body(@body a: object) {
    return {a};
  }

  @post("/body/parse")
  bodyParse(@body() a: Data) {
    return {a};
  }

  @post("/upload")
  upload(@body() a: IUploadedFile) {
    return {a};
  }
}

@router("/a3")
export class A3 {

  @get("/")
  @use(dummyMiddleware)
  inc() {
    return {};
  }
}

export class A4 {

  @get("/error/raw")
  error() {
    throw new Error("BOOM");
  }
}
