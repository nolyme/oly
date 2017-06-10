import * as _autoprefixer from "autoprefixer";
import * as BabiliPlugin from "babili-webpack-plugin";
import * as CleanWebpackPlugin from "clean-webpack-plugin";
import * as CopyPlugin from "copy-webpack-plugin";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as NyanProgressPlugin from "nyan-progress-webpack-plugin";
import * as OpenBrowserPlugin from "open-browser-webpack-plugin";
import { join, resolve } from "path";
import * as _webpack from "webpack";
import { Configuration, Entry, Rule } from "webpack";

const {
  LoaderOptionsPlugin,
  DefinePlugin,
  optimize: {
    UglifyJsPlugin,
  },
} = _webpack;

export { Configuration, NewModule } from "webpack";

/**
 * Loaders ref.
 */
export const loaders = {
  lessLoaderFactory,
  sassLoaderFactory,
  cssLoaderFactory,
  typescriptLoaderFactory,
  imageLoaderFactory,
  fontLoaderFactory,
};

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
 * Easy configuration.
 */
export interface IToolsOptions {

  /**
   * Required webpack file entries.
   */
  entry: string | string[] | Entry;

  /**
   * Current working directory.
   * Default is `process.cwd()`.
   */
  root?: string;

  /**
   * Enable css extractor.
   * Default is true.
   */
  extract?: boolean;

  /**
   * Enable prod mode.
   * This will minimize bundle size but make compilation slower.
   * This options is also available with env variables.
   *
   * ```
   * NODE_ENV=production webpack
   * # or
   * webpack -p
   * ```
   *
   * Default is false.
   */
  production?: boolean;

  /**
   * Path to the dist directory.
   * Default is `${root}/www`.
   */
  dist?: string;

  /**
   * Path to the assets directory.
   * Assets are copied without any transformations in the dist directory.
   * Disable by default.
   */
  assets?: string;

  /**
   * Absolute path to the `index.html`.
   * Default is `oly-tools/webpack/index.html`
   */
  template?: string;

  /**
   * Opens a new browser tab when Webpack loads.
   * Default is false.
   */
  open?: boolean;

  /**
   * Display nyan cat during the compilation.
   * Default is false.
   */
  nyan?: boolean;

  /**
   * Override typescript loader.
   */
  typescriptLoader?: Rule;

  /**
   * Override font loader.
   */
  fontLoader?: Rule;

  /**
   * Override image loader.
   */
  imageLoader?: Rule;

  /**
   * Override style loader.
   */
  styleLoader?: Rule;
}

/**
 * Create a default webpack configuration.
 *
 * ```typescript
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
 * ```typescript
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
  const isProduction =
    (process.argv.indexOf("-p") > -1)
    || process.env.NODE_ENV === "production"
    || options.production === true;

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

    extensions: [".webpack.js", ".js", ".web.js", ".ts", ".tsx"],

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
    publicPath: "/",
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
    ],
  };

  // Plugins

  config.plugins = [
    // important for react, useful for projects
    // 'process.env.NODE_ENV' will be replaced by true/false
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(isProduction ? "production" : "development"),
      },
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

  if (options.open === true) {
    config.plugins.push(new OpenBrowserPlugin());
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
      new BabiliPlugin({}),
    );

    //
    // WARNING:
    // for now, we can't uglify code in es6 :((
    //
    // config.plugins.push(
    //   new UglifyJsPlugin({
    //     beautify: false,
    //     comments: false,
    //     compress: {
    //       screw_ie8: true,
    //       warnings: false,
    //     },
    //     mangle: {
    //       keep_fnames: true,
    //       screw_ie8: true,
    //     },
    //   }),
    // );
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

/**
 * Typescript loader factory
 */
function typescriptLoaderFactory(): Rule {
  return {
    exclude: /node_modules/,
    test: /\.tsx?$/,
    use: [{
      loader: "awesome-typescript-loader",
      options: {
        silent: true,
        // speedup compile time, our ide will check error for us beside
        transpileOnly: true,
        module: "es2015",
        moduleResolution: "node",
      },
    }],
  };
}

/**
 * CSS loader factory
 */
function cssLoaderFactory(): Rule {
  return {
    loader: ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: [{loader: "css-loader"}],
    }),
    test: /\.css$/,
  };
}

/**
 * Less loader factory
 *
 * @param lessLoaderOptions   less options
 */
function lessLoaderFactory(lessLoaderOptions: object = {}): Rule {
  return {
    loader: ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: [
        {loader: "css-loader"},
        {loader: "postcss-loader", options: {plugins: () => [autoprefixer]}},
        {loader: "less-loader", options: lessLoaderOptions},
      ],
    }),
    test: /\.(css|less)$/,
  };
}

/**
 * Sass loader factory
 *
 * @param sassLoaderOptions  sass options
 */
function sassLoaderFactory(sassLoaderOptions: object = {}): Rule {
  return {
    loader: ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: [
        {loader: "css-loader"},
        {loader: "postcss-loader", options: {plugins: () => [autoprefixer]}},
        {loader: "sass-loader", options: sassLoaderOptions},
      ],
    }),
    test: /\.(css|scss|sass)$/,
  };
}

/**
 * Image loader factory
 */
function imageLoaderFactory(isProduction: boolean = false): Rule {
  return {
    test: /\.(png|jpeg|jpg|svg)$/,
    use: [{
      loader: "file-loader",
      options: {
        name: isProduction
          ? "images/[name].[hash].[ext]"
          : "images/[name].[ext]",
      },
    }],
  };
}

/**
 * Font loader factory
 */
function fontLoaderFactory(isProduction: boolean = false) {
  return {
    test: /\.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
    use: [{
      loader: "file-loader",
      options: {
        name: isProduction
          ? "fonts/[name].[hash].[ext]"
          : "fonts/[name].[ext]",
      },
    }],
  };
}
