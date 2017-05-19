import { IKoaMiddleware } from "oly-http";
import { array, field } from "oly-mapper";
import { del } from "../src/decorators/del";
import { get } from "../src/decorators/get";
import { header } from "../src/decorators/header";
import { post } from "../src/decorators/post";
import { put } from "../src/decorators/put";
import { query } from "../src/decorators/query";
import { router } from "../src/decorators/router";
import { use } from "../src/decorators/use";
import { body, path } from "../src/index";
import { IUploadedFile } from "../src/interfaces";

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
  query( @query("a") a: string) {
    return { a };
  }

  @get("/query/required")
  queryRequired( @query({ name: "a", required: true }) a: string) {
    return { a };
  }

  @get("/header")
  header( @header("AuthorizatION") a: string) {
    return { a };
  }

  @get("/path/:id")
  path( @path("id") a: string) {
    return { a };
  }

  @get("/pathAsNumber/:id")
  pathAsNumber( @path("id") a: number) {
    return { a };
  }

  @post("/body")
  body( @body() a: object) {
    return { a };
  }

  @post("/body/parse")
  bodyParse( @body() a: Data) {
    return { a };
  }

  @post("/upload")
  upload( @body() a: IUploadedFile) {
    return { a };
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
