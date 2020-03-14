const fs                   = require('fs');
const TerserPlugin         = require('terser-webpack-plugin');
const path                 = require('path');
const webpack              = require('webpack')
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebPackPlugin    = require("html-webpack-plugin");

module.exports = ( env, argv ) => {

  return {
    entry: "./index.js",
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: true,
          cache: false,
          parallel: true,
          sourceMap: true, // Must be set to true if using source-maps in production
          terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
            extractComments: 'all',
            compress: {
              drop_console: true,
            },
          }
        }),
      ],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'public')
    },
    context: path.resolve(__dirname, 'src'),
    devServer: {
      contentBase: path.resolve(__dirname, 'public'),
      stats: 'errors-only',
      open: false,
      disableHostCheck: true,
      port: process.env.PORT || 3000,
      compress: false,
      https: {
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert'),
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.MY_VAR': JSON.stringify('productionddddddddd')
      })
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: [{
            loader:'babel-loader',
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"]
            }
          }]
        },
        {
          test: /\.(jpg|png|gif|svg)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: './assets/',
              }
            }
          ]
        },
        {
          test: /\.css$/,
          loader: 'style-loader'
        }, {
          test: /\.css$/,
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: "[name]__[local]___[hash:base64:5]",
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: "./index.html",
        filename: "./index.html"
      })
    ]
  }
}
