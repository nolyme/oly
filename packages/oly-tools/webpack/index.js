"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _autoprefixer = require("autoprefixer");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var CopyPlugin = require("copy-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var path_1 = require("path");
var _webpack = require("webpack");
var LoaderOptionsPlugin = _webpack.LoaderOptionsPlugin, DefinePlugin = _webpack.DefinePlugin, UglifyJsPlugin = _webpack.optimize.UglifyJsPlugin;
exports.loaders = {
    lessLoaderFactory: lessLoaderFactory,
    sassLoaderFactory: sassLoaderFactory,
    cssLoaderFactory: cssLoaderFactory,
    typescriptLoaderFactory: typescriptLoaderFactory,
    imageLoaderFactory: imageLoaderFactory,
    fontLoaderFactory: fontLoaderFactory,
};
exports.plugins = {
    ExtractTextPlugin: ExtractTextPlugin,
    HtmlWebpackPlugin: HtmlWebpackPlugin,
    CopyPlugin: CopyPlugin,
    CleanWebpackPlugin: CleanWebpackPlugin,
};
exports.autoprefixer = _autoprefixer;
exports.webpack = _webpack;
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
 * @param options {IToolsOptions}
 * @return {Configuration}
 */
function createConfiguration(options) {
    var config = {};
    var root = options.root || process.cwd();
    var isProduction = process.env.NODE_ENV === "production" || options.production === true;
    options.extract = options.extract !== false;
    options.timeout = options.timeout || 300;
    options.entry = options.entry || "./src/index.ts";
    options.dist = options.dist || path_1.resolve(root, "www");
    options.template = options.template || path_1.resolve(__dirname, "index.html");
    options.fontLoader = options.fontLoader || fontLoaderFactory(isProduction);
    options.imageLoader = options.imageLoader || imageLoaderFactory(isProduction);
    options.typescriptLoader = options.typescriptLoader || typescriptLoaderFactory();
    // default style loader does not use autoprefixer
    options.styleLoader = options.styleLoader || cssLoaderFactory();
    // devtool accepts a string to define type of source-map
    // set 'eval' for speeeeed
    config.devtool = "source-map";
    // set a default context (base)
    // it's basically your root directory
    // context are required in some case
    config.context = root;
    // Files
    // main entry (or entries)
    // can be a single file or an object of file
    config.entry = options.entry;
    // resolve provides options to navigate into node_modules/sources
    config.resolve = {
        // i have added ts and tsx for our typescript project
        extensions: [".webpack.js", ".js", ".web.js", ".ts", ".tsx"],
        // i have added 'webpack' in first to keep the compatibility with webpack1
        mainFields: ["webpack", "browser", "module", "main"],
        modules: [
            "node_modules",
            path_1.join(root, "node_modules"),
            path_1.join(__dirname, "../node_modules"),
        ],
    };
    config.resolveLoader = {
        modules: [
            "node_modules",
            path_1.join(root, "node_modules"),
            path_1.join(__dirname, "../node_modules"),
        ],
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
        ],
    };
    // Plugins
    config.plugins = [
        // important for react, useful for projects
        // 'process.env.NODE_ENV' will be replaced by true/false
        // this is cool for mask logs, speedup stuffs, ...
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
        new HtmlWebpackPlugin({ template: options.template }),
        // remove outdir
        new CleanWebpackPlugin([options.dist], {
            root: root,
            verbose: false,
        }),
    ];
    if (options.assets) {
        config.plugins.push(new CopyPlugin([{
                from: options.assets, to: "./",
            }]));
    }
    if (isProduction) {
        config.bail = true;
        config.plugins.push(new LoaderOptionsPlugin({
            debug: false,
            minimize: true,
        }), new UglifyJsPlugin({
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
        }));
    }
    // Dev Server
    config.devServer = {
        historyApiFallback: true,
        inline: true,
        stats: "errors-only",
        watchOptions: {
            aggregateTimeout: options.timeout,
        },
    };
    return config;
}
exports.createConfiguration = createConfiguration;
/**
 * Typescript loader factory
 */
function typescriptLoaderFactory() {
    return {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: [{
                loader: "awesome-typescript-loader",
                options: {
                    silent: true,
                    // speedup compile time, our ide will check error for us beside
                    transpileOnly: true,
                },
            }],
    };
}
/**
 * CSS loader factory
 */
function cssLoaderFactory() {
    return {
        loader: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [{ loader: "css-loader" }],
        }),
        test: /\.css$/,
    };
}
/**
 * Less loader factory
 *
 * @param options - less options
 */
function lessLoaderFactory(options) {
    return {
        loader: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
                { loader: "css-loader" },
                { loader: "postcss-loader", options: { plugins: function () { return [exports.autoprefixer]; } } },
                { loader: "less-loader", options: options },
            ],
        }),
        test: /\.(css|less)$/,
    };
}
/**
 * Sass loader factory
 *
 * @param options - sass options
 */
function sassLoaderFactory(options) {
    return {
        loader: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
                { loader: "css-loader" },
                { loader: "postcss-loader", options: { plugins: function () { return [exports.autoprefixer]; } } },
                { loader: "sass-loader", options: options },
            ],
        }),
        test: /\.(css|scss|sass)$/,
    };
}
/**
 * Image loader factory
 */
function imageLoaderFactory(isProduction) {
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
function fontLoaderFactory(isProduction) {
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
//# sourceMappingURL=index.js.map