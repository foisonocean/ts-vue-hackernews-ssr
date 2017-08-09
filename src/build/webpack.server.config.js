const { resolve } = require('path')

const webpack = require('webpack')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

const baseConfig = require('./webpack.base.config')

const config = merge(baseConfig, {
  target: 'node',

  devtool: '#source-map',

  entry: resolve(__dirname, '../entry-server.js'),

  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2',
  },

  resolve: {
    alias: {
      'create-api': './create-api-server',
    },
  },

  /**
   * See: https://webpack.js.org/configuration/externals/#externals
   * and https://github.com/liady/webpack-node-externals
   */
  externals: nodeExternals({
    // Do not externalize CSS files in case we need to import it from a dep
    whitelist: /\.css$/i,
  }),

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      'process.env.VUE_ENV': '"server"',
    }),

    new VueSSRServerPlugin(),
  ],
})

module.exports = config
