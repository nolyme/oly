const webpack = require("webpack");
const tools = require("oly-tools");

const config = module.exports = tools.createConfiguration({
  entry: [
    "oly-core/polyfill",
    "./web/main.ts",
    "./web/main.scss",
  ],
  styleLoader: tools.loaders.sassLoaderFactory(),
  assets: "./web/assets"
});

config.plugins.push(new webpack.DefinePlugin({
  "process.env.DOC": JSON.stringify(require("./test/doc.json")),
}));
