<template>
  <div id="qrcode">
    <vue-qr :text="item.value" :size="200" :margin="0" :logoMargin="2" v-for="item in qrValues" :key="item.id"></vue-qr>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import vueQr from 'vue-qr'
export default{
  props: ['parentDialog', 'parentData'],
  data () {
    return {
      qrUrl: this.baseUrl() + '/jkposdet/#/details',
      qrValues: []
    }
  },
  components: {
    vueQr
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    qrInit () {
      let qrValues = []
      this.parentData.forEach((item) => {
        qrValues.push(
          {
            id: item.position_id,
            name: item.position_name,
            value: this.qrUrl + '?proid=' + this.projectId + '&posid=' + item.position_id
          }
        )
      })
      this.qrValues = qrValues
      setTimeout(() => {
        this.downQrcode()
      }, 500)
    },
    downQrcode () {
      const qrValues = this.qrValues
      const eles = document.querySelectorAll('#qrcode img')
      for (let i = 0; i < qrValues.length; i++) {
        const iconUrl = eles[i].src
        let a = document.createElement('a')
        let event = new MouseEvent('click')
        a.download = qrValues[i].name
        a.href = iconUrl
        a.dispatchEvent(event)
      }
      this.$emit('parentFinish')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.qrInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.site{
  height: 100%;
  .module-container{
    height: 100%;
    padding: 0;
    .module-header{
      padding-left: 0;
      padding-right: 0;
      padding-bottom: 20px;
      .el-breadcrumb{
        padding-top: 15px;
        padding-left: 20px;
        padding-bottom: 15px;
        background: #ffffff;
      }
    }
    .module-content{
      height: 100%;
      padding-top: 10px;
      padding-right: 0;
      padding-bottom: 10px;
      padding-left: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .module-aside{
        height: 100%;
        padding: 5px;
        border-radius: 6px;
        border: 1px solid #cccccc;
      }
      .module-main{
        padding-top: 0;
        padding-right: 10px;
        padding-bottom: 0;
        padding-left: 20px;
        overflow: scroll;
        .search{
          padding-top: 5px;
          padding-bottom: 5px;
          .search-input{
            display: table;
            width: 100%;
            .item{
              display: table-cell;
              vertical-align: middle;
              width: 280px;
              font-size: 0;
              span{
                width: 70px;
                display: inline-block;
                line-height: 34px;
                font-size: 14px;
              }
            }
            .operate{
              display: table-cell;
              vertical-align: middle;
              text-align: right;
            }
          }
        }
      }
    }
  }
  .mult-dialog{
    .el-dialog__header{
      display: none;
    }
  }
}
</style>
