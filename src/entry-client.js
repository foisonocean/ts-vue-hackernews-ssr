import Vue from 'vue'

import { createApp } from './app'
import ProgressBar from './components/progress-bar.vue'

import 'es6-promise/auto'

// Global progress bar
const bar = Vue.prototype.bar = new Vue(ProgressBar).$mount()
document.body.appendChild(bar.$el)

// A global mixin that calls `asyncData` when a route component's params change
Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to,
      })
        .then(next)
        .catch(next)
    } else {
      next()
    }
  },
})

const { app, router, store } = createApp()

/**
 * Prime the store with server-initialized state.
 * The state is determined during SSR and inlined in the page markup.
 */
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

/**
 * Wait until router has resolved all async before hooks
 * and async components...
 */
router.onReady(
  () => {
    /**
     * Add router hook for handling asyncData.
     * Doing it after initial router is resolved so that we don't double-fetch
     * the data that we already have. Using router.beforeResolve() so that all
     * async components are resolved.
     */
    router.beforeResolve(
      (to, from, next) => {
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)
        let diffed = false
        const activated = matched.filter(
          (component, index) => diffed || (diffed = (prevMatched[index] !== component))
        )
        const asyncDataHooks = activated
          .map(c => c.asyncData)
          .filter(_ => _)

        if (!asyncDataHooks.length) {
          return next()
        }

        bar.start()

        Promise.all(
          asyncDataHooks.map(hook => hook({ store, route: to }))
            .then(() => {
              bar.finish()
              next()
            })
            .catch(next)
        )
      }
    )

    // Actually mount to DOM
    app.$mount('#app')
  }
)

// Service worker
if (location.protocol === 'https:' && navigator.serviceWorker) {
  navigator.serviceWorker.register('/service-worker.js')
}
