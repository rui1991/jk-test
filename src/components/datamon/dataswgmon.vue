<template>
  <div class="module-container">
    <div class="module-header">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>数据监控</el-breadcrumb-item>
        <el-breadcrumb-item>数据网关心跳监控</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="module-main">
      <div class="main-search main-search-single">
        <div class="item">
          <span>网关MAC</span>
          <el-input style="width: 160px;" v-model.trim="nowSearch.mac"></el-input>
        </div>
        <div class="item date" style="width: 480px;">
          <span>心跳时段</span>
          <el-date-picker
            style="width: 360px;"
            v-model="nowSearch.date"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm:ss"
            :time-arrow-control="true"
            :clearable="false"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间">
          </el-date-picker>
        </div>
        <div class="operate">
          <el-button type="primary" @click="searchList">搜索</el-button>
        </div>
      </div>
      <p class="hint-text red">注：网关5分钟一次心跳</p>
      <el-table class="list-table" :data="tableData" border style="width: 100%">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="project_name" label="项目名称"></el-table-column>
        <el-table-column width="200" label="网关MAC">
          <template slot-scope="scope">
            <span>{{ scope.row.gw_mac | formatMac }}</span>
          </template>
        </el-table-column>
        <el-table-column label="参考心跳次数">
          <template slot-scope="scope">
            <span v-if="scope.row.mins">{{ scope.row.mins }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="实际心跳次数">
          <template slot-scope="scope">
            <a href="javascript:void(0);" class="blue" @click="detClick(scope.row.gw_mac)" v-if="scope.row.gw_size">{{ scope.row.gw_size }}</a>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        prev-text="上一页"
        next-text="下一页"
        :current-page="nowPage"
        layout="sizes, prev, pager, next, total"
        :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
        :page-size="limit"
        @size-change="handleSizeChange"
        @current-change="pageChang"
        :total="total">
      </el-pagination>
    </div>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentMac="itemMac"
      :parentStartTime="search.date[0]"
      :parentEndTime="search.date[1]"
      @parentClose="detCancel">
    </det-module>
  </div>
</template>

<script>
// 引入详情组件
import detModule from '@/components/datamon/dataswgmon-det'
export default{
  name: 'dataswgmon',
  data () {
    return {
      search: {
        mac: '',
        date: []
      },
      nowSearch: {
        mac: '',
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now() | time.getTime() < Date.now() - 24 * 60 * 60 * 1000 * 7
        }
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemMac: '',
      detDialog: false
    }
  },
  created () {

  },
  mounted () {
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    const startTime = nowDate + ' 00:00:00'
    const nowTime = this.$common.getNowDate('yyyy-mm-dd hh:mm:ss')
    this.search.date = [startTime, nowTime]
    this.nowSearch.date = [startTime, nowTime]
    // 获取列表数据
    this.getListData()
  },
  components: {
    detModule
  },
  methods: {
    /* 搜索 */
    searchList () {
      let date = this.nowSearch.date
      if (date.length === 0) {
        this.$message({
          message: '请选择网关心跳时段',
          type: 'warning'
        })
        return
      }
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      let params = {
        gw_mac: this.search.mac,
        start_time: this.search.date[0],
        end_time: this.search.date[1],
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/manage/selGwHeartLog',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.mes
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
    // 切换单页大小
    handleSizeChange (limit) {
      // 设置大小
      this.limit = limit
      // 初始化页码
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 详情 */
    detClick (mac) {
      this.itemMac = mac
      this.detDialog = true
    },
    detCancel () {
      this.detDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../assets/css/base-column.css';
  .hint-text{
    height: 35px;
    line-height: 35px;
  }
</style>
