import { axios } from "oly-http";
import { parse } from "url";
import { proxy } from "../middlewares/proxy";

export class ReactProxyService {

  /**
   * Set up proxy.
   *
   * @param remote    Url where point is available
   */
  public useProxy(remote: string): any {
    return proxy(parse(remote));
  }

  /**
   * Try to get the template from remote.
   *
   * @param remote    Url where point is available
   */
  public async getTemplate(remote: string): Promise<string> {
    return (await axios.get(remote)).data;
  }
}
