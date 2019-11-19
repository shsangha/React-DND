const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.[hash].js",
    publicPath: "/"
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "awesome-typescript-loader"
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/,
        loader: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.module\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              sourceMap: true
            }
          },
          "sass-loader"
        ]
      }
    ]
  },
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
      filename: "index.html"
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/])
  ],
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    hot: true,
    historyApiFallback: true,
    publicPath: "/"
  },
  watch: true,
  watchOptions: {
    poll: 1000
  }
};
