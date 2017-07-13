import * as autoprefixer from "autoprefixer";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import { Rule } from "webpack";

/**
 * Typescript loader factory
 */
export function typescriptLoaderFactory(): Rule {
  return {
    exclude: /node_modules/,
    test: /\.tsx?$/,
    use: [{
      loader: "ts-loader",
      options: {
        silent: true,
        transpileOnly: true,
      },
    }],
  };
}

/**
 * CSS loader factory
 */
export function cssLoaderFactory(): Rule {
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
export function lessLoaderFactory(lessLoaderOptions: object = {}): Rule {
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
export function sassLoaderFactory(sassLoaderOptions: object = {}): Rule {
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
export function imageLoaderFactory(isProduction: boolean = false): Rule {
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
export function fontLoaderFactory(isProduction: boolean = false) {
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
