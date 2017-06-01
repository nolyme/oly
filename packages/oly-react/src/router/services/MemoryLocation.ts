import {
  Disposable,
  getParams,
  LocationPlugin,
  locationPluginFactory,
  LocationServices,
  MemoryLocationConfig,
  parseUrl,
  UIRouter,
} from "@uirouter/core";
import { _, Class } from "oly-core";

export class MemoryLocationServices implements LocationServices, Disposable {

  public static of(requestUrl: string): Class<MemoryLocationServices> {
    return class extends MemoryLocationServices { // tslint:disable-line
      public requestUrl = requestUrl;
    };
  }

  public requestUrl: string;
  public hash = () => parseUrl(this.requestUrl).hash;
  public path = () => parseUrl(this.requestUrl).path;
  public search = () => getParams(parseUrl(this.requestUrl).search);
  public url = () => this.requestUrl;
  public onChange = () => _.noop;
  public dispose = () => _.noop;
}

export class ServerLocationConfig extends MemoryLocationConfig { // tslint:disable-line
}

export const serverLocationPlugin: (url: string) => (router: UIRouter) => LocationPlugin = (url) => {
  return locationPluginFactory("oly.serverLocation", false, MemoryLocationServices.of(url), ServerLocationConfig);
};
