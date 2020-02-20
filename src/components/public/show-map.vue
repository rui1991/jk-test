<template>
  <div id="container"></div>
</template>

<script>
import BMap from 'BMap'
export default{
  props: ['parentState', 'parentLong', 'parentLat'],
  data () {
    return {

    }
  },
  created () {

  },
  methods: {
    mapInit () {
      // 创建map实例
      let map = new BMap.Map('container', {
        enableMapClick: false
      })
      // 判断是否有坐标
      const coordStr = this.parentCoord
      // 保存坐标
      this.coord = coordStr
      // 开启滚轮缩放地图
      map.enableScrollWheelZoom()
      // 禁用双击放大
      map.disableDoubleClickZoom()
      // 初始化地图,设置中心点坐标和地图级别
      let point = new BMap.Point(this.parentLong, this.parentLat)
      map.centerAndZoom(point, 19)
      // 创建标注
      let marker = new BMap.Marker(point)
      // 将标注添加到地图中
      map.addOverlay(marker)
    }
  },
  watch: {
    parentState (val, oldVal) {
      if (val) {
        this.mapInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  #container{
    width: 100%;
    height: 386px;
  }
</style>
