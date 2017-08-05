declare module 'vue-server-renderer/server-plugin' {
  import * as webpack from 'webpack';

  class VueSSRServerPlugin extends webpack.Plugin {}

  namespace VueSSRServerPlugin {}

  export = VueSSRServerPlugin;
}
