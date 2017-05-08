import { inject, Logger } from "oly-core";
import { resolve } from "path";
import * as webpack from "webpack";
import { IDoc } from "./interfaces";

export class DocBuilder {

  @inject private logger: Logger;

  public async build(output: string, doc: IDoc) {
    process.env.NODE_ENV = "production";

    const compiler = webpack(this.createWebpackConfiguration(output, doc));
    await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
  }

  private createWebpackConfiguration(output: string, doc: IDoc): object {
    this.logger.info("run webpack");

    const tools = require("oly-tools");
    const config = tools.createConfiguration({
      dist: output,
      entry: [
        "oly-core/polyfill",
        "./web/main.ts",
        "./web/main.scss",
      ],
      root: resolve(__dirname, ".."),
      styleLoader: tools.loaders.sassLoaderFactory(),
    });
    config.resolve.modules.push(resolve(__dirname, "../node_modules"));
    config.plugins.push(new webpack.DefinePlugin({
      "process.env.DOC": JSON.stringify(doc),
    }));

    return config;
  }
}
