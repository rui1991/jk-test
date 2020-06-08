<template>
  <div
    class="report-site"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>报表管理</el-breadcrumb-item>
          <el-breadcrumb-item>个人巡检执行报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <!-- 组织树 -->
          <el-tree
            :data="orgTree"
            ref="tree"
            show-checkbox
            node-key="id"
            :props="defaultProps">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item">
                <span>员工名称</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="item">
                <span>任务名称</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.task"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" @click="searchList">搜索</el-button>
              </div>
            </div>
            <div class="search-input">
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
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" border :summary-method="getSummaries" show-summary style="width: 100%">
            <el-table-column fixed type="index" width="50" label="序号"></el-table-column>
            <el-table-column fixed prop="project_name" label="机构名称" width="150"></el-table-column>
            <el-table-column prop="userGroup" label="员工名称/组名称" width="150"></el-table-column>
            <el-table-column prop="plan_name" label="任务名称" width="150"></el-table-column>
            <el-table-column prop="insSize" label="任务数" width="100"></el-table-column>
            <el-table-column prop="continueSize" label="完成次数" width="120"></el-table-column>
            <el-table-column prop="notContinueSize" label="未完成次数" width="120"></el-table-column>
            <el-table-column label="完成率" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.continueRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="ontimeSize" label="完成及时数" width="120"></el-table-column>
            <el-table-column prop="outtimeSize" label="完成超时数" width="120"></el-table-column>
            <el-table-column label="完成及时率" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.ontimeRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="approvalSize" label="审批数" width="100"></el-table-column>
            <el-table-column prop="approvalPassSize" label="审批通过数" width="120"></el-table-column>
            <el-table-column label="审批通过率" width="120">
              <template slot-scope="scope">
                <span>{{ scope.row.passRate | formatPercent }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="putwoSize" label="报单数" width="100"></el-table-column>
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
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// 引入组织树组件
// import orgModule from '@/components/report/report-org'
export default{
  name: 'reportStaff',
  data () {
    return {
      search: {
        date: [],
        name: '',
        task: ''
      },
      nowSearch: {
        date: [],
        name: '',
        task: ''
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      itemProject: false,
      tableData: [],
      groupContent: '',
      total: 0,
      nowPage: 1,
      limit: 10,
      downDisabled: false,
      loading: false
    }
  },
  created () {

  },
  mounted () {
    // 时段
    const nowDate = this.$common.getNowDate('yyyy-mm-dd')
    if (this.date.length === 0) {
      this.search.date = [nowDate, nowDate]
      this.nowSearch.date = [nowDate, nowDate]
      this.setReportDate([nowDate, nowDate])
    } else {
      this.search.date = this.date
      this.nowSearch.date = this.date
    }
  },
  components: {
    // orgModule
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId'
    ]),
    ...mapState('other', [
      'orgTree'
    ]),
    ...mapState('report', [
      'organizeId',
      'date'
    ])
  },
  methods: {
    ...mapActions('report', [
      'setReportDate'
    ]),
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 查询范围条件判断
      this.orgDispose()
      // // 设置报表时间
      // const date = this.search.date
      // this.setReportDate(date)
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
      // 项目
      const projectsNode = nodesData.filter(item => {
        return item.organize_type === 3
      })
     if (projectsNode.length > 0) {
        this.itemProject = false
        let ids = []
        projectsNode.forEach(item => {
          ids.push(item.base_id)
        })
        ids = ids.join(',')
        this.getProjectsData(ids)
      } else {
        this.$message({
          showClose: true,
          message: '请重新选择查询范围，不能查询部门报表！',
          type: 'warning'
        })
        return
      }
    },
    // 获取多项目列表数据
    getProjectsData (ids) {
      let date = this.search.date
      let params = {
        project_ids: ids,
        seltype: 2,
        user_name: this.search.name,
        plan_name: this.search.task,
        start_date: date[0],
        end_date: date[1],
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/report/v3.4/selUserInspectTask',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.userTask
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
    getSummaries (param) {
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
        if (index === 7) {
          const values = data.map(item => Number(item.continueRate))
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
        if (index === 10) {
          const values = data.map(item => Number(item.ontimeRate))
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
        if (index === 13) {
          const values = data.map(item => Number(item.passRate))
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
      // 查询范围条件判断
      this.orgDispose()
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 查询范围条件判断
      this.orgDispose()
    },
    /* 获取组人员 */
    getGrouoCrew (id) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        group_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v2.6/selUserByGroupId',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          let crewData = []
          resData.forEach(item => {
            crewData.push(item.user_name)
          })
          const groupContent = crewData.join('、')
          this.groupContent = groupContent
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
    /* 导出文件 */
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
      // 项目
      const projectsNode = nodesData.filter(item => {
        return item.organize_type === 3
      })
      // 获取列表数据
     if (projectsNode.length > 0) {
        let ids = []
        projectsNode.forEach(item => {
          ids.push(item.base_id)
        })
        ids = ids.join(',')
        this.downProjectsFile(ids)
      } else {
        this.$message({
          showClose: true,
          message: '请重新选择导出范围，不能导出部门报表！',
          type: 'warning'
        })
        return
      }
    },
    downProjectsFile (ids) {
      let date = this.search.date || []
      let params = {
        project_ids: ids,
        seltype: 2,
        user_name: this.search.name,
        plan_name: this.search.task,
        start_date: date[0],
        end_date: date[1]
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = '/ezx_jk/report/v3.4/selUserInspectTaskEO?' + params
    }
  },
  watch: {

  }
}
</script>

<style lang="less" scoped>
  .report-site{
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
