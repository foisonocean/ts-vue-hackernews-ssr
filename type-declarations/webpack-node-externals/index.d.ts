declare module 'webpack-node-externals' {
  import * as webpack from 'webpack';

  function webpackNodeExternals (config: any): webpack.ExternalsElement;

  namespace webpackNodeExternals {}

  export = webpackNodeExternals;
}
