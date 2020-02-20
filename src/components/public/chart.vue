<template>
  <div class="chart" :id="id"></div>
</template>

<script>
export default{
  props: ['parOption', 'id', 'domWidth'],
  data () {
    return {
      chart: ''
    }
  },
  created () {

  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.chart = this.$echarts.init(document.getElementById(this.id))
      this.chart.setOption(this.parOption)
    }
  },
  watch: {
    parOption: {
      handler (val, oldVal) {
        if (this.chart) {
          this.chart.setOption(val)
        }
      },
      deep: true
    },
    domWidth (val, oldVal) {
      this.chart.resize()
    }
  }
}
</script>

<style lang="less" scoped>
  .chart{
    width: 100%;
    height: 100%;
  }
</style>
