<template>
  <div
    class="crewclock"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
          <el-breadcrumb-item>人员打卡率报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <!-- 组织树 -->
          <org-module @parentUpdata="orgUpdata"></org-module>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
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
              <div class="item" v-show="orgType === 3">
                <span>胸牌编号</span>
                <el-input style="width: 160px;" v-model="nowSearch.mac"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" @click="searchList">搜索</el-button>
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
            <div class="search-input">
              <div class="item" v-show="orgType === 3">
                <span>员工姓名</span>
                <el-input style="width: 160px;" v-model="nowSearch.name"></el-input>
              </div>
              <div class="operate"></div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData1" border :summary-method="getSummaries1" show-summary style="width: 100%" v-show="orgType !== 3">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column width="200" :show-overflow-tooltip="true" prop="organize_name" label="组织机构"></el-table-column>
            <el-table-column prop="all_po_size" label="地址总数"></el-table-column>
            <el-table-column prop="all_set_user" label="打卡人数"></el-table-column>
            <el-table-column label="打卡点位数">
              <template slot-scope="scope">
                <span class="red" v-if="scope.row.position_size < scope.row.po_size">{{ scope.row.position_size }}</span>
                <span v-else>{{ scope.row.position_size }}</span>
              </template>
            </el-table-column>
            <el-table-column label="未打卡点位数">
              <template slot-scope="scope">
                <span class="red" v-if="scope.row.notRecordSize > 0">{{ scope.row.notRecordSize  }}</span>
                <span v-else>0</span>
              </template>
            </el-table-column>
            <el-table-column label="打卡率">
              <template slot-scope="scope">
                <span>{{ scope.row.recordRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="in_out_size" label="进入次数"></el-table-column>
            <el-table-column label="点位平均停留时长（分）">
              <template slot-scope="scope">
                <span>{{ scope.row.avwaittime | formatNum }}</span>
              </template>
            </el-table-column>
            <el-table-column label="点位之间间隔时长（分）">
              <template slot-scope="scope">
                <span>{{ scope.row.avrecord | formatNum }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-table class="list-table" :data="tableData2" border :summary-method="getSummaries2" show-summary style="width: 100%" v-show="orgType === 3">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column width="180" :show-overflow-tooltip="true" label="胸牌编号">
              <template slot-scope="scope">
                <span v-if="scope.row.card_mac">{{ scope.row.card_mac }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="user_name" label="姓名"></el-table-column>
            <el-table-column width="200" :show-overflow-tooltip="true" prop="positions" label="点名地址"></el-table-column>
            <el-table-column prop="po_size" label="负责点位数"></el-table-column>
            <el-table-column label="打卡点位数">
              <template slot-scope="scope">
                <span class="red" v-if="scope.row.position_size < scope.row.po_size">{{ scope.row.position_size }}</span>
                <span v-else>{{ scope.row.position_size }}</span>
              </template>
            </el-table-column>
            <el-table-column label="未打卡点位数">
              <template slot-scope="scope">
                <a href="javascript:;" class="red" v-if="scope.row.notRecordSize > 0" @click="detClick(scope.row.user_id, scope.row.positions)">{{ scope.row.notRecordSize  }}</a>
                <span v-else>0</span>
              </template>
            </el-table-column>
            <el-table-column label="打卡率">
              <template slot-scope="scope">
                <span>{{ scope.row.recordRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="in_out_size" label="进入次数"></el-table-column>
            <el-table-column label="点位平均停留时长（分）">
              <template slot-scope="scope">
                <span>{{ scope.row.avwaittime | formatNum }}</span>
              </template>
            </el-table-column>
            <el-table-column label="点位之间间隔时长（分）">
              <template slot-scope="scope">
                <span>{{ scope.row.avrecord | formatNum }}</span>
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
      :parentUid="detUid"
      :parentState="detState"
      :parentStart="search.date[0]"
      :parentEnd="search.date[1]"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入组织树组件
import orgModule from '@/components/public/org-radio'
// 引入详情组件
import detModule from '@/components/quality/crewclock-det'
export default{
  name: 'crewclock',
  data () {
    return {
      search: {
        date: [],
        name: '',
        mac: ''
      },
      nowSearch: {
        date: [],
        name: '',
        mac: ''
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
      detUid: 0,
      detState: 1,
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
  filters: {
    countRate (want, already) {
      if (!want) return '0%'
      if (!already) return '0%'
      let rate = already / want
      return Math.round(rate * 100) + '%'
    }
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
      const startDate = date[0]
      const endDate = date[1]
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
        url: this.sysetApi() + '/v2.0/selRollCallReport823',
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
      let mac = this.search.mac
      mac = mac.replace(/:/g, '')
      let params = {
        user_id: this.userId,
        project_id: this.proId,
        user_name: this.search.name,
        card_mac: mac,
        start_date: date[0] || '',
        end_date: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selRollCallReport',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData2 = res.data.data1.reports
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
    // 合计表格规则设置
    getSummaries1 (param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (index === 1) {
          sums[index] = '-'
          return
        }
        if (index === 4) {
          const values = data.map(item => Number(item.position_size))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 5) {
          const values = data.map(item => Number(item.notRecordSize))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 6) {
          const values = data.map(item => Number(item.recordRate))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100)
            sums[index] = average + '%'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 8) {
          const values = data.map(item => Number(item.avwaittime))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 9) {
          const values = data.map(item => Number(item.avrecord))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
          } else {
            sums[index] = ''
          }
          return
        }
        const vals = data.map(item => Number(item[column.property]))
        if (!vals.every(value => isNaN(value))) {
          sums[index] = vals.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          })
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
    getSummaries2 (param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (index === 1 || index === 2 || index === 3) {
          sums[index] = '-'
          return
        }
        if (index === 5) {
          const values = data.map(item => Number(item.position_size))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 6) {
          const values = data.map(item => Number(item.notRecordSize))
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 7) {
          const values = data.map(item => Number(item.recordRate))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100)
            sums[index] = average + '%'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 9) {
          const values = data.map(item => Number(item.avwaittime))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
          } else {
            sums[index] = ''
          }
          return
        }
        if (index === 10) {
          const values = data.map(item => Number(item.avrecord))
          if (!values.every(value => isNaN(value))) {
            let sum = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            })
            const size = data.length
            let average = sum / size
            average = Math.round(average * 100) / 100
            sums[index] = average + '分'
          } else {
            sums[index] = ''
          }
          return
        }
        const vals = data.map(item => Number(item[column.property]))
        if (!vals.every(value => isNaN(value))) {
          sums[index] = vals.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          })
        } else {
          sums[index] = ''
        }
      })
      return sums
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
    detClick (uid, positions) {
      this.detUid = uid
      let detState = 1
      if (positions === '全部') {
        detState = 0
      }
      this.detState = detState
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 导出 */
    downFile () {
      let date = this.search.date || []
      if (this.orgType === 3) {
        let mac = this.search.mac
        mac = mac.replace(/:/g, '')
        let params = {
          user_id: this.userId,
          project_id: this.proId,
          user_name: this.search.name,
          card_mac: mac,
          start_date: date[0] || '',
          end_date: date[1] || ''
        }
        params = this.$qs.stringify(params)
        this.downDisabled = true
        setTimeout(() => {
          this.downDisabled = false
        }, 5000)
        window.location.href = this.sysetApi() + '/v2.0/selRollCallReportEO?' + params
      } else {
        let params = {
          user_id: this.userId,
          ogz_id: this.orgId,
          start_date: date[0] || '',
          end_date: date[1] || ''
        }
        params = this.$qs.stringify(params)
        this.downDisabled = true
        setTimeout(() => {
          this.downDisabled = false
        }, 5000)
        window.location.href = this.sysetApi() + '/v2.0/selRollCallReport823EO?' + params
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
.crewclock{
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
}
</style>
