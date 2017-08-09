const { resolve } = require('path')

const webpack = require('webpack')
const merge = require('webpack-merge')
const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const baseConfig = require('./webpack.base.config')

const config = merge(baseConfig, {
  entry: {
    app: resolve(__dirname, '../entry-client.js'),
  },

  resolve: {
    alias: {
      'create-api': './create-api-client',
    },
  },

  plugins: [
    // Strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      'process.env.VUE_ENV': '"client"',
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // A module is extracted into vendor chunk if...
        return (
          // It's inside node_modules
          /node_modules/.test(module.context) &&
          // And it's not a CSS file
          // (due to extract-text-webpack-plugin limitation)
          !/\.css&/.test(module.require)
        )
      },
    }),

    /**
     * Extract webpack runtime & manifest to avoid
     * vendor hash changing on every build.
     */
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
    }),

    new VueSSRClientPlugin(),
  ],
})

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    // Auto generate service worker
    new SWPrecachePlugin({
      cacheId: 'vue-hackernews',
      filename: 'service-worker.js',
      minify: true,
      dontCacheBustUrlsMatching: /./,
      staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
      runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'networkFirst',
        },
        {
          urlPattern: /\/(top|new|show|ask|jobs)/,
          handler: 'networkFirst',
        },
        {
          urlPattern: '/item/:id',
          handler: 'networkFirst',
        },
        {
          urlPattern: '/user/:id',
          handler: 'networkFirst',
        },
      ],
    })
  )
}

module.exports = config
