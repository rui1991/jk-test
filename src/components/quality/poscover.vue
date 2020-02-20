<template>
  <div
    class="poscover"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
          <el-breadcrumb-item>位置巡查覆盖率</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <!-- 组织树 -->
          <org-module @parentUpdata="orgUpdata"></org-module>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="item date">
              <span>选择时段</span>
              <el-date-picker
                style="width: 280px;"
                v-model="nowSearch.date"
                type="daterange"
                value-format="yyyy-MM-dd"
                :clearable="false"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
            </div>
          </div>
          <el-table class="list-table" :data="tableData1" border style="width: 100%" :cell-class-name="cellClassName" v-show="orgType !== 3">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column width="200" :show-overflow-tooltip="true" prop="organize_name" label="组织机构"></el-table-column>
            <el-table-column width="120" prop="date" label="日期"></el-table-column>
            <el-table-column prop="all_po_size" label="地址数"></el-table-column>
            <el-table-column prop="recordPoSize" label="已巡查地址数"></el-table-column>
            <el-table-column prop="notRecordPoSize" label="未巡查地址数"></el-table-column>
            <el-table-column prop="workUserSize" label="巡查人数"></el-table-column>
            <el-table-column label="平均巡查次数">
              <template slot-scope="scope">
                <span>{{ scope.row.avRecordSize | formatNum }}</span>
              </template>
            </el-table-column>
            <el-table-column label="位置巡查率">
              <template slot-scope="scope">
                <span>{{ scope.row.workRate | formatPercent }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-table class="list-table" :data="tableData2" border style="width: 100%" v-show="orgType === 3">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column prop="organize_name" label="所属区域"></el-table-column>
            <el-table-column width="120" prop="date" label="日期"></el-table-column>
            <el-table-column prop="all_po_size" label="地址数"></el-table-column>
            <el-table-column prop="recordPoSize" label="已巡查地址数"></el-table-column>
            <el-table-column label="未巡查地址数">
              <template slot-scope="scope">
                <a href="javascript:;" class="red" v-if="scope.row.notRecordPoSize > 0" @click="detClick(scope.row.at_id, scope.row.date)">{{ scope.row.notRecordPoSize  }}</a>
                <span v-else>0</span>
              </template>
            </el-table-column>
            <el-table-column prop="workUserSize" label="巡查人数"></el-table-column>
            <el-table-column label="平均巡查次数">
              <template slot-scope="scope">
                <span>{{ scope.row.avRecordSize | formatNum }}</span>
              </template>
            </el-table-column>
            <el-table-column label="位置巡查率">
              <template slot-scope="scope">
                <span>{{ scope.row.workRate | formatPercent }}</span>
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
        </el-main>
      </el-container>
    </el-container>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentPro="proId"
      :parentArea="detArea"
      :parentDate="detDate"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入组织树组件
import orgModule from '@/components/public/org-radio'
// 引入详情组件
import detModule from '@/components/quality/poscover-det'
export default{
  name: 'poscover',
  data () {
    return {
      search: {
        date: []
      },
      nowSearch: {
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now() - 8.64e7
        }
      },
      orgId: 0,
      orgType: 0,
      proId: 0,
      tableData1: [],
      tableData2: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      detArea: 0,
      detDate: 1,
      downDisabled: true,
      loading: false
    }
  },
  created () {
    const nowDate = this.$common.getBeforeDate()
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
  },
  components: {
    orgModule,
    detModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 组织树
    orgUpdata (data) {
      this.orgId = data.id
      this.orgType = data.type
      this.proId = data.projectId
      // 清空搜索框
      this.search.name = ''
      this.nowSearch.name = ''
      // 当前页码初始化
      this.nowPage = 1
      if (data.type === 3) {
        // 获取列表数据
        this.getListDetData()
      } else {
        // 获取列表数据
        this.getListAllData()
      }
    },
    // 搜索
    searchList () {
      let date = this.search.date || []
      const startDate = date[0] || ''
      const endDate = date[1] || ''
      const fate = this.getDateDiff(startDate, endDate)
      if (fate) {
        this.$message({
          showClose: true,
          message: '查询时长不能超过31天',
          type: 'warning'
        })
        return
      }
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      if (this.orgType === 3) {
        this.getListDetData()
      } else {
        this.getListAllData()
      }
    },
    // 获取列表数据
    getListAllData () {
      if (!this.orgId) {
        return
      }
      let date = this.search.date || []
      let params = {
        user_id: this.userId,
        ogz_id: this.orgId,
        start_date: date[0] || '',
        end_date: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selPoPatrolCoverRate',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData1 = res.data.data1.message
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    getListDetData () {
      let date = this.search.date || []
      let params = {
        user_id: this.userId,
        project_id: this.proId,
        start_date: date[0] || '',
        end_date: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selProPoPatrolCoverRate',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData2 = res.data.data1.message
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.loading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 表格项
    cellClassName ({row, column, rowIndex, columnIndex}) {
      if (columnIndex === 5) {
        return 'red'
      }
    },
    // 切换单页大小
    handleSizeChange (limit) {
      // 设置大小
      this.limit = limit
      // 初始化页码
      this.nowPage = 1
      // 获取列表数据
      if (this.orgType === 3) {
        this.getListDetData()
      } else {
        this.getListAllData()
      }
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      if (this.orgType === 3) {
        this.getListDetData()
      } else {
        this.getListAllData()
      }
    },
    // 获取跨越天数
    getDateDiff (startDate, endDate) {
      let startTime = new Date(Date.parse(startDate.replace(/-/g, '/'))).getTime()
      let endTime = new Date(Date.parse(endDate.replace(/-/g, '/'))).getTime()
      const seaDuration = endTime - startTime
      const maxDuration = 1000 * 60 * 60 * 24 * 31
      if (seaDuration > maxDuration) {
        return true
      } else {
        return false
      }
    },
    /* 详情 */
    detClick (area, date) {
      this.detArea = area
      this.detDate = date
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 导出 */
    downFile () {
      let date = this.search.date || []
      if (this.orgType === 3) {
        let params = {
          user_id: this.userId,
          project_id: this.proId,
          start_date: date[0],
          end_date: date[1]
        }
        params = this.$qs.stringify(params)
        this.downDisabled = true
        setTimeout(() => {
          this.downDisabled = false
        }, 5000)
        window.location.href = this.sysetApi() + '/v2.0/selProPoPatrolCoverRateEO?' + params
      } else {
        let params = {
          user_id: this.userId,
          ogz_id: this.orgId,
          start_date: date[0],
          end_date: date[1]
        }
        params = this.$qs.stringify(params)
        this.downDisabled = true
        setTimeout(() => {
          this.downDisabled = false
        }, 5000)
        window.location.href = this.sysetApi() + '/v2.0/selPoPatrolCoverRateEO?' + params
      }
    }
  },
  watch: {
    orgId (val, oldVal) {
      if (val) {
        this.downDisabled = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .poscover{
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
            display: table;
            width: 100%;
            height: 60px;
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
            .date{
              width: 420px;
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
</style>
