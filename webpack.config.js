const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development", // Set the mode to development
  entry: "./src/index.js", // Entry point for the application
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"), // Output directory
    clean: true, // Clean the output directory before emit
  },
  devtool: "eval-source-map",
  devServer: {
    static: './dist',
    watchFiles: ["./src/template.html"],
    open: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html", // Template HTML file
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.js$/,
        exclude: ['node_modules'],
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      config$: './configs/app-config.js',
      react: './vendor/react-master',
    },
    extensions: ['.js', '.jsx'],
    modules: [
      'node_modules',
      'bower_components',
      'shared',
      '/shared/vendor/modules',
    ],
  },
};