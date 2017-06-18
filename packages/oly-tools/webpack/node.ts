import * as CleanWebpackPlugin from "clean-webpack-plugin";
import * as CopyPlugin from "copy-webpack-plugin";
import { join, resolve } from "path";
import * as webpack from "webpack";
import { Configuration, LoaderOptionsPlugin } from "webpack";
import { IToolsOptions } from "./interfaces";
import { typescriptLoaderFactory } from "./loaders";

const nodeExternals = require("webpack-node-externals");

/**
 *
 * @param options
 * @returns {Configuration}
 */
export const createNodeConfiguration = (options: IToolsOptions) => {

  const config: Configuration = {};
  const root = options.root || process.cwd();
  const env = typeof options.env === "object" ? options.env : {};
  const isProduction =
    (process.argv.indexOf("-p") > -1)
    || process.env.NODE_ENV === "production"
    || options.production === true
    || (!!env.production || env.NODE_ENV === "production");

  env.NODE_ENV = isProduction ? "production" : "development";

  options.entry = options.entry || "./src/index.ts";
  options.dist = options.dist || resolve(root, "www");
  options.typescriptLoader = options.typescriptLoader || typescriptLoaderFactory();

  // define the format of the source-map
  // set to false for disabled it
  config.devtool = "source-map";

  // set a default context (base)
  // it's the root directory for all relative path
  config.context = root;

  // main entry (or entries)
  // can be a single file or an object of file
  config.entry = options.entry;

  // resolve provides options to navigate into node_modules/sources
  config.resolve = {

    extensions: [".webpack.js", ".js", ".web.js", ".ts", ".tsx", ".json"],

    mainFields: ["main"],

    modules: [
      "node_modules",
      join(root, "node_modules"),
      join(__dirname, "../node_modules"),
    ],
  };

  config.resolveLoader = {
    modules: config.resolve.modules,
  };

  config.output = {
    filename: isProduction ? "[name].[hash].js" : "[name].js",
    path: options.dist,
  };

  // Loaders

  config.module = {
    rules: [
      options.typescriptLoader,
      {
        test: /\.json$/,
        use: "json-loader",
      },
    ],
  };

  // Plugins

  config.plugins = [
    new webpack.IgnorePlugin(/\.(css|less|scss)$/),
    // remove outdir
    new CleanWebpackPlugin([options.dist], {
      root,
      verbose: false,
    }),
    new CopyPlugin([{
      from: root + "/package.json", to: "./",
    }].concat(options.assets ? [{
      from: options.assets, to: "./",
    }] : [])),
  ];

  if (isProduction) {

    config.bail = true;

    config.plugins.push(
      new LoaderOptionsPlugin({
        debug: false,
        minimize: true,
      }),
    );
  }

  config.node = {
    Buffer: false,
  };

  config.target = "node";

  config.externals = [nodeExternals()];

  return config;
};
