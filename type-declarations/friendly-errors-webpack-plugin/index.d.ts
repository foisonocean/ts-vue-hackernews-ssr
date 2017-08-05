declare module 'friendly-errors-webpack-plugin' {
    import * as webpack from 'webpack';

    class FriendlyErrorsWebpackPlugin extends webpack.Plugin {}

    namespace FriendlyErrorsWebpackPlugin {}

    export = FriendlyErrorsWebpackPlugin;
  }
