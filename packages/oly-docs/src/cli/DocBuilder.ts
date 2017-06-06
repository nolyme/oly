import { inject, Logger } from "oly-core";
import { resolve } from "path";
import * as webpack from "webpack";
import webpackConfig from "../../webpack.config";
import { IDocs } from "./interfaces";

export class DocBuilder {

  @inject private logger: Logger;

  public async build(output: string, doc: IDocs) {
    process.env.NODE_ENV = "production";
    const compiler = webpack(this.createWebpackConfiguration(output, doc));
    await new Promise((resolve, reject) => {
      this.logger.info("run webpack");
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
    this.logger.debug("webpack compilation is over");
  }

  private createWebpackConfiguration(output: string, doc: IDocs): object {
    this.logger.debug("create webpack config");
    const config = webpackConfig("production");

    config.resolve.modules.push(resolve(__dirname, "../../node_modules"));

    return config;
  }
}
