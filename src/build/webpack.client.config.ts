import * as webpack from 'webpack';
import * as merge from 'webpack-merge';
import * as SWPrecachePlugin from 'sw-precache-webpack-plugin';
import * as VueSSRClientPlugin from 'vue-server-renderer/client-plugin';

import baseConfig from './webpack.base.config';

const config: webpack.Configuration = merge(
  baseConfig,
  {
    entry: {
      app: './src/entry-client',
    },
    resolve: {
      alias: {
        'create-api': './create-api-client',
      },
    },
    plugins: [
      // Strip dev-only code in Vue source
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.VUE_ENV': '"client"',
      }),

      // Extract vendor chunks for better caching
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks (module) {
          // A module is extracted into the vendor chunk if...
          return (
            // It's inside node_modules
            /node_modules/.test(module.context) &&
            // And not a CSS file (due to extract-text-webpack-plugin limitation)
            !/\.css$/.test(module.request)
          );
        },
      }),

      // Extract webpack runtime & manifest to avoid vendor chunk hash changing
      // On every build.
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
      }),

      new VueSSRClientPlugin(),
    ],
  },
);

if (process.env.NODE_ENV === 'production') {
  (config.plugins as any[]).push(
    // Auto generate service worker
    new SWPrecachePlugin({
      cacheId: 'vue-hn',
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
    }),
  );
}

export default config;
