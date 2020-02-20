<template>
  <el-dialog title="地图标点" :visible.sync="parentDialog" width="50%" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
    <div class="seaech">
      <el-input style="width: 60%; margin-right: 5px;" placeholder="请输地址名称" prefix-icon="el-icon-search" v-model.trim="position"></el-input>
      <el-button type="primary" @click="seaechClick">搜索</el-button>
    </div>
    <div id="container"></div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import BMap from 'BMap'
export default{
  props: ['parentDialog', 'parentCoord'],
  data () {
    return {
      map: null,
      position: '',
      disabled: true,
      coord: ''
    }
  },
  created () {

  },
  methods: {
    mapInit () {
      // 清空搜索框
      this.position = ''
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
      if (coordStr) {
        let pointArr = coordStr.split(',')
        const pointLng = Number.parseFloat(pointArr[0])
        const pointLat = Number.parseFloat(pointArr[1])
        // 初始化地图,设置中心点坐标和地图级别
        let point = new BMap.Point(pointLng, pointLat)
        map.centerAndZoom(point, 16)
        // 创建标注
        let marker = new BMap.Marker(point)
        // 将标注添加到地图中
        map.addOverlay(marker)
        // 开启标注拖拽功能
        marker.enableDragging()
        marker.addEventListener('dragend', e => {
          this.coord = e.point.lng + ',' + e.point.lat
        })
      } else {
        // 默认以北京天安门为中心创建Map实例，初始化地图,设置中心点坐标和地图级别
        map.centerAndZoom(new BMap.Point(116.404, 39.915), 12)
      }
      // 点击地图
      map.addEventListener('click', e => {
        // 获取当前地图级别
        const level = map.getZoom()
        // 清除地图上的所有标点
        map.clearOverlays()
        let point = new BMap.Point(e.point.lng, e.point.lat)
        map.centerAndZoom(point, level)
        // 创建标注
        let marker = new BMap.Marker(point)
        // 将标注添加到地图中
        map.addOverlay(marker)
        this.coord = e.point.lng + ',' + e.point.lat
        // 开启标注拖拽功能
        marker.enableDragging()
        marker.addEventListener('dragend', e => {
          this.coord = e.point.lng + ',' + e.point.lat
        })
      })
      this.map = map
    },
    seaechClick () {
      // 获取map实例
      const map = this.map
      // 获取地址名称
      const position = this.position
      // 创建地址解析器实例
      let myGeo = new BMap.Geocoder()
      myGeo.getPoint(position, pt => {
        if (pt) {
          map.centerAndZoom(pt, 16)
        }
      })
    },
    confirmClick () {
      const coord = this.coord
      this.$emit('parentUpdata', coord)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        setTimeout(() => {
          this.mapInit()
        }, 100)
        // this.mapInit()
      }
    },
    coord (val, oldVal) {
      if (val) {
        this.disabled = false
      } else {
        this.disabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .seaech{
    height: 60px;
  }
  #container{
    width: 100%;
    height: 400px;
  }
</style>
