const webpack = require('webpack')
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const env = process.env.NODE_ENV
const isProd = env === 'production'
const path = require('path')

let plugins = [
  new LodashModuleReplacementPlugin(),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env)
  })
]

if (isProd) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }))
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: isProd ? 'redux-persist.min.js' : 'redux-persist.js',
    library: 'redux-persist',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  plugins,
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }
}
