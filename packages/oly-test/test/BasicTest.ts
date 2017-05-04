import { inject, injectable, Kernel } from "oly-core";
import { run, test } from "../src/helpers";

export class Http {
  async get(url: string) {
    return {ok: true};
  }
}

@injectable({provide: Http})
export class MockHttp {
  async get(url: string) {
    return {ok: false};
  }
}

/**
 *
 */

export class BasicTest {

  @test watwat(kernel: Kernel) {
    expect(true).toEqual(true);
  }
}

@run(new Kernel().with(MockHttp))
export class BasicMockTest {

  @inject() http: Http;

  @test("This is a super test")
  async something(kernel: Kernel) {
    expect(typeof kernel.id).toBe("string");
    expect(await this.http.get("/")).toEqual({ok: false});
  }
}

