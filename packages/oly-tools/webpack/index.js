'use strict';

/**
 * Dependencies
 */

const path = require('path');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {
  LoaderOptionsPlugin,
  DefinePlugin,
  optimize: {
    UglifyJsPlugin
  }
} = webpack;

/**
 * Exports
 */

module.exports = {
  autoprefixer: autoprefixer,
  webpack: webpack,
  createConfiguration: createConfiguration,
  loaders: {
    lessLoaderFactory: lessLoaderFactory,
    sassLoaderFactory: sassLoaderFactory,
    cssLoaderFactory: cssLoaderFactory,
    typescriptLoaderFactory: typescriptLoaderFactory,
    imageLoaderFactory: imageLoaderFactory,
    fontLoaderFactory: fontLoaderFactory,
  },
  plugins: {
    ExtractTextPlugin: ExtractTextPlugin,
    HtmlWebpackPlugin: HtmlWebpackPlugin,
    CopyPlugin: CopyPlugin,
    CleanWebpackPlugin: CleanWebpackPlugin
  }
};

/**
 * Debug mode is enabled by default.
 * Set NODE_ENV=production for a optimized build.
 *
 * @param options               {object}          Global options
 * @param options.root          {string}          current working directory
 * @param options.entry         {string}          [REQUIRED] webpack entry file
 * @param options.sourceMaps    {boolean}         Enable source maps
 * @param options.extract       {boolean}         Enable css extraction
 * @param options.timeout       {number}          Add timeout between each refresh
 * @param options.dist          {string}          dist directory
 * @param options.assets        {string}          assets directory
 * @param options.template      {string}          index.html absolute path
 * @param options.typescriptLoader      {object}  override current loader
 * @param options.fontLoader            {object}  override current loader
 * @param options.imageLoader           {object}  override current loader
 * @param options.styleLoader           {object}  override current loader
 */
function createConfiguration(options) {
  options = options || {};

  const config = {};
  const root = options.root || process.cwd();
  const isProduction = process.env['NODE_ENV'] === 'production';

  options.extract = options.extract !== false;
  options.timeout = options.timeout || 300;
  options.entry = options.entry || './src/index.ts';
  options.dist = options.dist || path.resolve(root, 'www');
  options.template = options.template || path.resolve(__dirname, 'index.html');
  options.fontLoader = options.fontLoader || fontLoaderFactory(isProduction);
  options.imageLoader = options.imageLoader || imageLoaderFactory(isProduction);
  options.typescriptLoader = options.typescriptLoader || typescriptLoaderFactory();

  // default style loader does not use autoprefixer
  options.styleLoader = options.styleLoader || cssLoaderFactory();

  // devtool accepts a string to define type of source-map
  // set 'eval' for speeeeed
  config.devtool = 'source-map';

  // set a default context (base)
  // it's basically your root directory
  // context are required in some case
  config.context = root;

  // Files

  // main entry (or entries)
  // can be a single file or an object of file
  config.entry = {
    main: options.entry
  };

  // resolve provides options to navigate into node_modules/sources
  config.resolve = {
    // i have added 'webpack' in first to keep the compatibility with webpack1
    mainFields: ["webpack", "browser", "module", "main"],
    // i have added ts and tsx for our typescript project
    extensions: ['.webpack.js', '.js', '.web.js', '.ts', '.tsx'],
    modules: [
      path.join(root, 'node_modules'),
      path.join(__dirname, '../node_modules')
    ]
  };

  config.output = {
    path: options.dist,
    filename: isProduction ? '[name].[hash].js' : '[name].js'
  };

  // Loaders

  config.module = {
    rules: [
      options.typescriptLoader,
      options.styleLoader,
      options.fontLoader,
      options.imageLoader
    ]
  };

  // Plugins

  config.plugins = [
    // important for react, useful for projects
    // 'process.env.NODE_ENV' will be replaced by true/false
    // this is cool for mask logs, speedup stuffs, ...
    new DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
      }
    }),
    // extract css from js
    new ExtractTextPlugin({
      filename: isProduction ? "[name].[hash].css" : '[name].css',
      disable: !options.extract
    }),
    // create index.html for us
    new HtmlWebpackPlugin({template: options.template}),
    // remove outdir
    new CleanWebpackPlugin([options.dist], {
      root: root,
      verbose: false,
    })
  ];

  if (options.assets) {
    config.plugins.push(
      new CopyPlugin([{
        from: options.assets, to: './'
      }])
    );
  }

  if (isProduction) {
    config.bail = true;
    config.plugins.push(
      new LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new UglifyJsPlugin({
        comments: false,
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true
        },
        compress: {
          screw_ie8: true,
          warnings: false
        }
      })
    )
  }

  // Dev Server

  config.devServer = {
    stats: 'errors-only',
    inline: true,
    historyApiFallback: true,
    watchOptions: {
      aggregateTimeout: options.timeout
    }
  };

  return config;
}

/**
 * Typescript loader factory
 */
function typescriptLoaderFactory() {
  return {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [{
      loader: 'awesome-typescript-loader',
      options: {
        silent: true,
        // speedup compile time, our ide will check error for us beside
        transpileOnly: true
      }
    }]
  };
}

/**
 * CSS loader factory
 */
function cssLoaderFactory() {
  return {
    test: /\.css$/,
    loader: ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: [{loader: 'css-loader'}]
    })
  };
}

/**
 * Less loader factory
 *
 * @param options - less options
 */
function lessLoaderFactory(options) {
  return {
    test: /\.(css|less)$/,
    loader: ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: [
        {loader: 'css-loader'},
        {loader: 'postcss-loader', options: {plugins: () => [autoprefixer]}},
        {loader: 'less-loader', options: options}
      ]
    })
  }
}

/**
 * Sass loader factory
 *
 * @param options - sass options
 */
function sassLoaderFactory(options) {
  return {
    test: /\.(css|scss|sass)$/,
    loader: ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: [
        {loader: 'css-loader'},
        {loader: 'postcss-loader', options: {plugins: () => [autoprefixer]}},
        {loader: 'sass-loader', options: options}
      ]
    })
  }
}

/**
 * Image loader factory
 */
function imageLoaderFactory(isProduction) {
  return {
    test: /\.(png|jpeg|jpg|svg)$/,
    use: [{
      loader: 'file-loader',
      options: {
        name: isProduction
          ? 'images/[name].[hash].[ext]'
          : 'images/[name].[ext]'
      }
    }]
  };
}

/**
 * Font loader factory
 */
function fontLoaderFactory(isProduction) {
  return {
    test: /\.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
    use: [{
      loader: 'file-loader',
      options: {
        name: isProduction
          ? 'fonts/[name].[hash].[ext]'
          : 'fonts/[name].[ext]'
      }
    }]
  };
}
