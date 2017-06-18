import * as _autoprefixer from "autoprefixer";
import * as CleanWebpackPlugin from "clean-webpack-plugin";
import * as CopyPlugin from "copy-webpack-plugin";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as NyanProgressPlugin from "nyan-progress-webpack-plugin";
import { join, resolve } from "path";
import * as _webpack from "webpack";
import { Configuration } from "webpack";
import { IToolsOptions } from "./interfaces";
import * as _loaders from "./loaders";
import { cssLoaderFactory, fontLoaderFactory, imageLoaderFactory, typescriptLoaderFactory } from "./loaders";

const {
  LoaderOptionsPlugin,
  DefinePlugin,
  optimize: {
    UglifyJsPlugin,
  },
} = _webpack;

export { Configuration, NewModule } from "webpack";
export * from "./synchronize";
export * from "./node";
export * from "./interfaces";

/**
 * Loaders ref.
 */
export const loaders = _loaders;

/**
 * Plugins ref.
 */
export const plugins = {
  ExtractTextPlugin,
  HtmlWebpackPlugin,
  CopyPlugin,
  CleanWebpackPlugin,
};

/**
 * Autoprefix ref.
 */
export const autoprefixer = _autoprefixer;

/**
 * Webpack ref.
 */
export const webpack = _webpack;

/**
 * Create a default webpack configuration.
 *
 * ```ts
 * import { createConfiguration } from "oly-tools";
 *
 * export default createConfiguration({
 *   entry: "./src/main.browser.tsx",
 * });
 * ```
 *
 * Even if it's cool to have a ready2go webpack configuration,
 * you should avoid this function and make your own configuration.
 *
 * ```ts
 * export default (env: string) => {
 *
 *  const config = createConfiguration({
 *   entry: "./src/main.browser.tsx",
 *  });
 *
 *  // edit config here
 *
 *  return config;
 * }
 * ```
 *
 * @param options {IToolsOptions}
 * @return {Configuration}
 */
export function createConfiguration(options: IToolsOptions): Configuration {

  const config: Configuration = {};
  const root = options.root || process.cwd();
  const env = typeof options.env === "object" ? options.env : {};
  const isProduction =
    (process.argv.indexOf("-p") > -1)
    || process.env.NODE_ENV === "production"
    || options.production === true
    || (!!env.production || env.NODE_ENV === "production");

  env.NODE_ENV = isProduction ? "production" : "development";

  options.extract = options.extract !== false;
  options.entry = options.entry || "./src/index.ts";
  options.dist = options.dist || resolve(root, "www");
  options.template = options.template || resolve(__dirname, "index.html");
  options.fontLoader = options.fontLoader || fontLoaderFactory(isProduction);
  options.imageLoader = options.imageLoader || imageLoaderFactory(isProduction);
  options.typescriptLoader = options.typescriptLoader || typescriptLoaderFactory();
  options.styleLoader = options.styleLoader || cssLoaderFactory();

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

    mainFields: ["webpack", "browser", "module", "main"],

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
      options.styleLoader,
      options.fontLoader,
      options.imageLoader,
      {
        test: /\.json$/,
        use: "json-loader",
      },
    ],
  };

  // Plugins

  config.plugins = [
    // important for react, useful for projects
    // 'process.env.NODE_ENV' will be replaced by true/false
    new DefinePlugin({
      "process.env": Object
        .keys(env)
        .reduce((o, key) => {
          o[key] = JSON.stringify(env[key]);
          return o;
        }, {}),
    }),
    // extract css from js
    new ExtractTextPlugin({
      disable: !options.extract,
      filename: isProduction ? "[name].[hash].css" : "[name].css",
    }),
    // create index.html for us
    new HtmlWebpackPlugin({
      template: options.template,
    }),
  ];

  if (options.assets) {
    config.plugins.push(
      new CopyPlugin([{
        from: options.assets, to: "./",
      }]),
    );
  }

  if (options.nyan === true) {
    config.plugins.push(new NyanProgressPlugin({
      nyanCatSays: (progress) => progress === 1 && "oly!",
    }));
  }

  if (isProduction) {

    config.bail = true;

    config.plugins.push(
      new LoaderOptionsPlugin({
        debug: false,
        minimize: true,
      }),
      // remove outdir
      new CleanWebpackPlugin([options.dist], {
        root,
        verbose: false,
      }),
    );

    config.plugins.push(
      new UglifyJsPlugin({
        beautify: false,
        comments: false,
        compress: {
          screw_ie8: true,
          warnings: false,
        },
        mangle: {
          keep_fnames: true,
          screw_ie8: true,
        },
      }),
    );
  }

  // Axios & some universal libs use Buffer in their code
  // Webpack see this and try to emulate Buffer with a big code
  config.node = {
    Buffer: false,
  };

  // Dev Server

  config.devServer = {
    historyApiFallback: true,    // pushState mode
    inline: true,
    stats: "errors-only",
  };

  return config;
}
