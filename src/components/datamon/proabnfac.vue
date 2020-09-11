<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>数据监控</el-breadcrumb-item>
        <el-breadcrumb-item><router-link to="/main/abnfacmon">异常设备监控</router-link></el-breadcrumb-item>
        <el-breadcrumb-item>{{ modTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="item">
          <span>项目名称</span>
          <el-input style="width: 240px;" v-model.trim="searchText"></el-input>
        </div>
      </div>
      <el-table class="list-table" :data="tableData" border style="width: 580px; margin: 0 auto;">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="project_name" :show-overflow-tooltip="true" label="项目"></el-table-column>
        <el-table-column width="150" label="异常数">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="red" @click="detClick(scope.row.project_id)">{{ scope.row.count_size }}</a>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentPro="nowProid"
      :parentType="$route.query.type"
      :parentFacType="$route.query.facType"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
/**
 * 参数说明：
 *  type: 1当天    3近三天
 *  facType：    collector数据采集器     position地址设备       dataswg数据网关
 * */
// 引入详情组件
import detModule from '@/components/datamon/proabnfac-det'
export default{
  name: 'proabnfac',
  data () {
    return {
      modTitle: '项目异常设备',
      reqApiName: '',
      searchText: '',
      otableData: [],
      nowProid: 0,
      detDialog: false
    }
  },
  created () {

  },
  mounted () {
    const facType = this.$route.query.facType
    switch (facType) {
      case 'collector':
        this.modTitle = '项目异常数据采集器'
        this.reqApiName = '/selProAbnormalDataCardMes'
        break
      case 'position':
        this.modTitle = '项目异常地址设备'
        this.reqApiName = '/selProAbnormalDataPoMes'
        break
      case 'dataswg':
        this.modTitle = '项目异常数据网关'
        this.reqApiName = '/selProAbnormalGatewayMes'
        break
    }
    // 获取列表数据
    if (!this.reqApiName) return
    this.getListData()
  },
  components: {
    detModule
  },
  computed: {
    tableData () {
      let search = this.searchText
      let reg = new RegExp(search, 'i')
      if (search) {
        return this.otableData.filter(item => {
          if (item.project_name.match(reg)) {
            return item
          }
        })
      }
      return this.otableData
    }
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        project_name: '',
        type: this.$route.query.type
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/manage' + this.reqApiName,
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1 || []
          this.otableData = resData
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 详情 */
    detClick (id) {
      this.nowProid = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
</style>
