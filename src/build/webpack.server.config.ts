import * as webpack from 'webpack';
import * as merge from 'webpack-merge';
import * as webpackNodeExternals from 'webpack-node-externals';
import * as VueSSRServerPlugin from 'vue-server-renderer/server-plugin';

import baseConfig from './webpack.base.config';

const config: webpack.Configuration = merge(
  baseConfig,
  {
    target: 'node',
    devtool: '#source-map',
    entry: './src/entry-server',
    output: {
      filename: 'server-bundle.js',
      libraryTarget: 'commonjs2',
    },
    resolve: {
      alias: {
        'create-api': './create-api-server',
      },
    },

    // See: https://webpack.js.org/configuration/externals/#externals
    // See: https://github.com/liady/webpack-node-externals
    externals: webpackNodeExternals({
      // Do not externalize CSS files in case we need to import it from a dep
      whitelist: /\.css$/,
    }),

    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.VUE_ENV': '"server"',
      }),
      new VueSSRServerPlugin(),
    ],
  },
);

export default config;
