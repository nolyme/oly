import { readFile } from "fs";
import { _, inject, Kernel } from "oly-core";
import { serve } from "oly-http";

export class ReactStaticService {

  @inject(Kernel)
  protected kernel: Kernel;

  /**
   * Set up static server.
   *
   * @param www   Directory path where point is available
   */
  public useStatic(www: string): any {
    const cache = _.isProduction() ? 1000 * 60 * 60 * 24 : 0;
    return serve(www, {index: false, maxage: cache});
  }

  /**
   * Try to get the template from local directory.
   *
   * @param www    Directory path where point is available
   */
  public async getTemplate(www: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      readFile(www + "/index.html", "UTF-8", (err, template) => {
        if (err) {
          reject(err);
        } else {
          resolve(template);
        }
      });
    });
  }
}
