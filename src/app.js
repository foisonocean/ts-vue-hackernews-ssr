import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import App from './app.vue'
import { createStore } from './store'
import { createRouter } from './router'
import titleMixin from './util/title'
import * as filters from './util/filters'

// Mixin for handling title
Vue.mixin(titleMixin)

// Register global utility filters
Object.keys(filters).forEach(
  key => {
    Vue.filter(key, filters[key])
  }
)

/**
 * Expose a factory function that creates a fresh set of store, router,
 * app instance on each call (which is called for each SSR request)
 */
export function createApp () {
  // Create store and router instances
  const store = createStore()
  const router = createRouter()

  /**
   * Sync the router with the vuex store.
   * This registers `store.state.route`
   */
  sync(store, router)

  /**
   * Create the app instance.
   * Here we inject the router, store and ssr context to all child components,
   * making them available everywhere as `this.$router` and `this.$store`.
   */
  const app = new Vue({
    router,
    store,
    render: h => h(App),
  })

  /**
   * Expose the app, the router and the store.
   * Note we are not mounting the app here, since bootstrapping will be
   * different depending on whether we are in a browser or on the server.
   */
  return {
    app,
    router,
    store,
  }
}
