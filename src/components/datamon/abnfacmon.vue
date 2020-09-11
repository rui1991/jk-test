<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>数据监控</el-breadcrumb-item>
        <el-breadcrumb-item>异常设备监控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="general">
        <el-row :gutter="20">
          <el-col :span="12">
            <div
              class="general-item"
              v-loading="datafacLoading"
              element-loading-text="拼命加载中"
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(0, 0, 0, 0.6)">
              <div class="item-head">
                <div class="title">
                  <span class="chunk"></span>
                  <p class="txt">异常数据设备</p>
                </div>
                <p class="hint-text">近3天</p>
              </div>
              <div class="item-body">
                <div class="body-single">
                  <router-link :to="{ path: '/main/proabnfac', query:{type: 3, facType: 'collector'}}" class="price red">{{ collectorNum }}</router-link>
                  <span class="name">数据采集器（张）</span>
                </div>
                <div class="body-single">
                  <router-link :to="{ path: '/main/proabnfac', query:{type: 3, facType: 'position'}}" class="price red">{{ posfacNum }}</router-link>
                  <span class="name">地址设备（个）</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div
              class="general-item"
              v-loading="swgfacLoading"
              element-loading-text="拼命加载中"
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(0, 0, 0, 0.6)">
              <div class="item-head">
                <div class="title">
                  <span class="chunk"></span>
                  <p class="txt">异常网关设备</p>
                </div>
                <el-select v-model="swgfacType" class="operate" style="width: 120px;" @change="getSwgFacility">
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div class="item-body">
                <div class="body-single">
                  <router-link :to="{ path: '/main/proabnfac', query:{type: swgfacType, facType: 'dataswg'}}" class="price red">{{ swgfacNum }}</router-link>
                  <span class="name">数据网关（台）</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
export default{
  name: 'abnfacmon',
  data () {
    return {
      datafacLoading: false,
      swgfacLoading: false,
      sensorfacLoading: false,
      typeOptions: [
        {
          value: 1,
          label: '今天'
        },
        {
          value: 3,
          label: '近3天'
        }
      ],
      collectorNum: 0,
      posfacNum: 0,
      swgfacType: 1,
      swgfacNum: 0,
      loraNum: 0
    }
  },
  created () {

  },
  mounted () {
    // 异常数据设备
    this.getDataFacility()
    // 异常网关设备
    this.getSwgFacility()
  },
  methods: {
    /* 异常数据设备 */
    getDataFacility () {
      let params = {
        type: 3
      }
      params = this.$qs.stringify(params)
      this.datafacLoading = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/manage/selAbnormalDataMes',
        data: params
      }).then((res) => {
        this.datafacLoading = false
        if (res.data.result === 'Sucess') {
          let resData = res.data.data1.abnormalData
          if (resData) {
            this.collectorNum = resData.collectorSize || 0
            this.posfacNum = resData.positionSize || 0
          } else {
            this.collectorNum = 0
            this.posfacNum = 0
          }
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.datafacLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 异常网关设备 */
    getSwgFacility () {
      let params = {
        type: this.swgfacType
      }
      params = this.$qs.stringify(params)
      this.swgfacLoading = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/manage/selAbnormalGatewayMes',
        data: params
      }).then((res) => {
        this.swgfacLoading = false
        if (res.data.result === 'Sucess') {
          let resData = res.data.data1
          if (resData) {
            this.swgfacNum = resData.abnormalGateway || 0
          } else {
            this.swgfacNum = 0
          }
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.swgfacLoading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
  .module-container .module-main {
    background-color: transparent;
    .general {
      .general-item{
        margin-top: 10px;
        padding-top: 10px;
        padding-left: 20px;
        padding-right: 20px;
        padding-bottom: 10px;
        background: #ffffff;
        border-radius: 6px;
        .item-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 45px;
          .title{
            display: flex;
            align-items: center;
            height: 100%;
            .chunk {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #4e97d8;
            }
            .txt{
              padding-left: 10px;
              font-size: 18px;
              color: #333;
            }
          }
          .hint-text{
            padding-left: 30px;
          }
          .operate{
            padding-left: 30px;
          }
        }
        .item-body{
          height: 150px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          .body-single{
            width: 25%;
            height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            .price{
              font-weight: 600;
              font-size: 16px;
            }
            .name {
              margin-top: 10px;
              color: #686868;
              font-size: 14px;
            }
          }
        }
      }
    }
  }
</style>
