var path = require('path');
var plugins = require('webpack-load-plugins')();
const webpack = require('webpack');

module.exports = {
   entry: {
      app: ["./src/js/coreLibrary.js"]
   },
   module: {
      preLoaders: [
         {
            test: /.js$/, // include .js files
            exclude: /node_modules/, // exclude any and all files in the node_modules folder
            loader: "jshint-loader"
         }
      ],
      loaders: [{
         test: /.js$/,
         exclude: /node_modules/,
         loader: 'babel-loader',
         query: {
            presets: ['es2015']
         }
      }]
   },
   output: {
      path: path.resolve(__dirname, "dist"),
      publicPath: "/dist/",
      filename: "core.min.js"
   },
   devServer: {
      contentBase: "./build",
   },
   plugins: [
      new webpack.optimize.UglifyJsPlugin({
         compress: {
            warnings: false
         }
      })
   ]
};