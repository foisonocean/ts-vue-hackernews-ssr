<template>
  <div
    class="progress"
    :style="{
      width: percent + '%',
      height: height,
      'background-color': canSuccess ? color : failedColor,
      opacity: show ? 1 : 0,
    }"
  >
  </div>
</template>

<script>
export default {
  data () {
    return {
      percent: 0,
      show: false,
      canSuccess: true,
      duration: 3000,
      height: '2px',
      color: '#ffca2b',
      failedColor: '#ff0000',
    }
  },

  methods: {
    start () {
      this.show = true
      this.canSuccess = true

      if (this._timer) {
        clearInterval(this._timer)
        this.percent = 0
      }

      this._cut = 1000 / Math.floor(this.duration)
    }
  }
}
</script>

