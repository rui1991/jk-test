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
          <div style="padding-bottom: 5px;">
            <el-input
              placeholder="输入关键字进行过滤"
              clearable
              v-model="filterText">
            </el-input>
          </div>
          <!-- 组织树 -->
          <el-tree
            :data="orgTree"
            ref="tree"
            show-checkbox
            node-key="id"
            :props="defaultProps"
            :filter-node-method="filterNode">
          </el-tree>
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
              <div class="item" v-show="itemProject">
                <span>胸牌编号</span>
                <el-input style="width: 160px;" v-model="nowSearch.mac"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" @click="searchList">搜索</el-button>
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
            <div class="search-input">
              <div class="item" v-show="itemProject">
                <span>员工姓名</span>
                <el-input style="width: 160px;" v-model="nowSearch.name"></el-input>
              </div>
              <div class="operate"></div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData1" border :summary-method="getSummaries1" show-summary style="width: 100%" v-show="!itemProject">
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
          <el-table class="list-table" :data="tableData2" border :summary-method="getSummaries2" show-summary style="width: 100%" v-show="itemProject">
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
                <a href="javascript:;" class="red" v-if="scope.row.notRecordSize > 0" @click="detClick(scope.row.project_id, scope.row.user_id, scope.row.positions)">{{ scope.row.notRecordSize  }}</a>
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
// 引入详情组件
import detModule from '@/components/quality/crewclock-det'
export default{
  name: 'crewclock',
  data () {
    return {
      filterText: '',
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
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      itemProject: false,
      tableData1: [],
      sumTableData1: {},
      tableData2: [],
      sumTableData2: {},
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      detUid: 0,
      detState: 1,
      proId: 0,
      downDisabled: false,
      loading: false
    }
  },
  created () {
    const nowDate = this.$common.getBeforeDate()
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
  },
  components: {
    detModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'orgTree'
    ])
  },
  methods: {
    // 触发页面显示配置的筛选
    filterNode (value, data, node) {
      // 如果什么都没填就直接返回
      if (!value) return true
      // 如果传入的value和data中的label相同说明是匹配到了
      if (data.name.indexOf(value) !== -1) return true
      // 否则要去判断它是不是选中节点的子节点
      return this.checkBelongNode(value, data, node)
    },
    // 判断传入的节点是不是选中节点的子节点
    checkBelongNode (value, data, node) {
      const level = node.level
      // 如果传入的节点本身就是一级节点就不用校验了
      if (level === 1) return false
      // 先取当前节点的父节点
      let parentData = node.parent
      // 遍历当前节点的父节点
      let index = 0
      while (index < level - 1) {
        // 如果匹配到直接返回
        if (parentData.data.name.indexOf(value) !== -1) {
          return true
        }
        // 否则的话再往上一层做匹配
        parentData = parentData.parent
        index++
      }
      // 没匹配到返回false
      return false
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
      // 查询范围条件判断
      this.orgDispose()
    },
    // 查询范围条件处理
    orgDispose () {
      // 获取节点
      const nodesData = this.$refs.tree.getCheckedNodes()
      if (nodesData.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择查询范围！',
          type: 'warning'
        })
        return
      }
      // 全部
      const allNode = nodesData.find(item => {
        return item.organize_type === 0
      })
      // 企业
      const firmNode = nodesData.find(item => {
        return item.organize_type === 1
      })
      // 项目
      const projectsNode = nodesData.filter(item => {
        return item.organize_type === 3
      })
      // 获取列表数据
      if (allNode) {
        this.itemProject = false
        this.getListAllData(allNode.id)
      } else if (firmNode) {
        this.itemProject = false
        this.getListAllData(firmNode.id)
      } else if (projectsNode.length > 1) {
        this.itemProject = false
        let ids = []
        projectsNode.forEach(item => {
          ids.push(item.base_id)
        })
        ids = ids.join(',')
        this.getProjectsData(ids)
      } else if (projectsNode.length === 1) {
        this.itemProject = true
        this.getListDetData(projectsNode[0].base_id)
      } else {
        this.$message({
          showClose: true,
          message: '请重新选择查询范围，不能查询部门报表！',
          type: 'warning'
        })
      }
    },
    // 获取分公司列表数据
    getListAllData (id) {
      let date = this.search.date || []
      let params = {
        user_id: this.userId,
        ogz_id: id,
        start_date: date[0] || '',
        end_date: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v2.0/selRollCallReport823',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData1 = res.data.data1.message
          this.sumTableData1 = res.data.data1.countMessage || {}
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
    // 获取多项目列表数据
    getProjectsData (ids) {
      let date = this.search.date || []
      let params = {
        user_id: this.userId,
        project_ids: ids,
        start_date: date[0] || '',
        end_date: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v2.0/selRollCallReport0224',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData1 = res.data.data1.message
          this.sumTableData1 = res.data.data1.countMessage || {}
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
    // 获取单项目列表数据
    getListDetData (id) {
      let date = this.search.date || []
      let mac = this.search.mac
      mac = mac.replace(/:/g, '')
      let params = {
        user_id: this.userId,
        project_id: id,
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
        url: '/ezx_jk/v2.0/selRollCallReport',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData2 = res.data.data1.reports
          this.sumTableData2 = res.data.data1.countMessage || {}
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
      const sumTableData = this.sumTableData1
      const columns = param.columns
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
        if (index === 2) {
          sums[index] = sumTableData.all_po_size
          return
        }
        if (index === 3) {
          sums[index] = sumTableData.all_set_user
          return
        }
        if (index === 4) {
          sums[index] = sumTableData.position_size
          return
        }
        if (index === 5) {
          sums[index] = sumTableData.notRecordSize
          return
        }
        if (index === 6) {
          // 打卡率
          const rate = this.$common.retainPercent(sumTableData.recordRate)
          sums[index] = rate
          return
        }
        if (index === 7) {
          sums[index] = sumTableData.in_out_size
          return
        }
        if (index === 8) {
          // 平均停留时长
          const stayTime = this.$common.formatNum(sumTableData.avwaittime, 2)
          sums[index] = stayTime + '分'
          return
        }
        if (index === 9) {
          // 点位间隔时长
          const intervalTime = this.$common.formatNum(sumTableData.avrecord, 2)
          sums[index] = intervalTime + '分'
        }
      })
      return sums
    },
    getSummaries2 (param) {
      const sumTableData = this.sumTableData2
      const columns = param.columns
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
        if (index === 4) {
          sums[index] = sumTableData.po_size
          return
        }
        if (index === 5) {
          sums[index] = sumTableData.position_size
          return
        }
        if (index === 6) {
          sums[index] = sumTableData.notRecordSize
          return
        }
        if (index === 7) {
          // 打卡率
          const rate = this.$common.retainPercent(sumTableData.recordRate)
          sums[index] = rate
          return
        }
        if (index === 8) {
          sums[index] = sumTableData.in_out_size
          return
        }
        if (index === 9) {
          // 平均停留时间
          const stayTime = this.$common.formatNum(sumTableData.avwaittime, 2)
          sums[index] = stayTime + '分'
          return
        }
        if (index === 10) {
          // 点位间隔时长
          const intervalTime = this.$common.formatNum(sumTableData.avrecord, 2)
          sums[index] = intervalTime + '分'
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
      // 查询范围条件判断
      this.orgDispose()
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 查询范围条件判断
      this.orgDispose()
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
    detClick (pid, uid, positions) {
      this.proId = pid
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
      // 获取节点
      const nodesData = this.$refs.tree.getCheckedNodes()
      if (nodesData.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择导出范围！',
          type: 'warning'
        })
        return
      }
      // 全部
      const allNode = nodesData.find(item => {
        return item.organize_type === 0
      })
      // 企业
      const firmNode = nodesData.find(item => {
        return item.organize_type === 1
      })
      // 项目
      const projectsNode = nodesData.filter(item => {
        return item.organize_type === 3
      })
      // 获取列表数据
      if (allNode) {
        this.downAllFile(allNode.id)
      } else if (firmNode) {
        this.downAllFile(firmNode.id)
      } else if (projectsNode.length > 1) {
        let ids = []
        projectsNode.forEach(item => {
          ids.push(item.base_id)
        })
        ids = ids.join(',')
        this.downProjectsFile(ids)
      } else if (projectsNode.length === 1) {
        this.downDetFile(projectsNode[0].base_id)
      } else {
        this.$message({
          showClose: true,
          message: '请重新选择导出范围，不能导出部门报表！',
          type: 'warning'
        })
      }
    },
    downAllFile (id) {
      let date = this.search.date || []
      let params = {
        user_id: this.userId,
        ogz_id: id,
        start_date: date[0] || '',
        end_date: date[1] || ''
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = '/ezx_jk/v2.0/selRollCallReport823EO?' + params
    },
    downProjectsFile (ids) {
      let date = this.search.date || []
      let params = {
        user_id: this.userId,
        project_ids: ids,
        start_date: date[0] || '',
        end_date: date[1] || ''
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = '/ezx_jk/v2.0/selRollCallReport0224EO?' + params
    },
    downDetFile (id) {
      let date = this.search.date || []
      let mac = this.search.mac
      mac = mac.replace(/:/g, '')
      let params = {
        user_id: this.userId,
        project_id: id,
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
      window.location.href = '/ezx_jk/v2.0/selRollCallReportEO?' + params
    }
  },
  watch: {
    filterText (val, oldVal) {
      this.$refs.tree.filter(val)
    }
  },
  filters: {
    countRate (want, already) {
      if (!want) return '0%'
      if (!already) return '0%'
      let rate = already / want
      return Math.round(rate * 100) + '%'
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
