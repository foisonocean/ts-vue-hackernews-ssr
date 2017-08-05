declare module 'vue-server-renderer/client-plugin' {
  import * as webpack from 'webpack';

  class VueSSRClientPlugin extends webpack.Plugin {}

  namespace VueSSRClientPlugin {}

  export = VueSSRClientPlugin;
}
