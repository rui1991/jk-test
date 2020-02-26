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
          <el-breadcrumb-item>巡检地址信息报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <!-- 组织树 -->
          <el-tree
            :data="orgTree"
            ref="tree"
            show-checkbox
            default-expand-all
            node-key="id"
            :props="defaultProps">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item">
                <span>地址名称</span>
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
            <el-table-column fixed prop="project_name" label="项目名称" width="200"></el-table-column>
            <el-table-column prop="position_name" label="地址名称" width="198"></el-table-column>
            <el-table-column prop="plan_name" label="任务名称" width="200"></el-table-column>
            <el-table-column prop="start_time" label="开始时间" width="190"></el-table-column>
            <el-table-column prop="end_time" label="结束时间" width="190"></el-table-column>
            <el-table-column prop="normalSize" label="正常" width="140"></el-table-column>
            <el-table-column prop="abnormalSize" label="异常" width="140"></el-table-column>
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
export default{
  name: 'reportSite',
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
      total: 0,
      nowPage: 1,
      limit: 10,
      detData: [],
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
      // 设置报表时间
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
        this.getListData(allNode.id)
      } else if (firmNode) {
        this.itemProject = false
        this.getListData(firmNode.id)
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
        this.getListData(projectsNode[0].id)
      } else {
        this.$message({
          showClose: true,
          message: '请重新选择查询范围，不能查询部门报表！',
          type: 'warning'
        })
        return
      }
    },
    // 获取列表数据
    getListData (id) {
      let date = this.search.date || []
      let params = {
        organize_id: id,
        project_name: '',
        position_name: this.search.name,
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
        url: this.reportApi() + '/v3.4/selInspectPosition',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.position
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
        project_ids: ids,
        seltype: 2,
        project_name: '',
        position_name: this.search.name,
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
        url: this.reportApi() + '/v3.4/selInspectPosition',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.position
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
        if (index === 1 || index === 2 || index === 3 || index === 4 || index === 5) {
          sums[index] = '-'
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
        this.downOtherFile(allNode.id)
      } else if (firmNode) {
        this.downOtherFile(firmNode.id)
      } else if (projectsNode.length > 1) {
        let ids = []
        projectsNode.forEach(item => {
          ids.push(item.base_id)
        })
        ids = ids.join(',')
        this.downProjectsFile(ids)
      } else if (projectsNode.length === 1) {
        this.downOtherFile(projectsNode[0].id)
      } else {
        this.$message({
          showClose: true,
          message: '请重新选择导出范围，不能导出部门报表！',
          type: 'warning'
        })
        return
      }
    },
    downOtherFile (id) {
      const date = this.search.date || []
      let params = {
        project_ids: ids,
        seltype: 2,
        project_name: '',
        position_name: this.search.name,
        plan_name: this.search.task,
        start_date: date[0],
        end_date: date[1]
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selInspectPositionEO?' + params
    },
    downProjectsFile (ids) {
      const date = this.search.date || []
      let params = {
        organize_id: id,
        project_name: '',
        position_name: this.search.name,
        plan_name: this.search.task,
        start_date: date[0],
        end_date: date[1]
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.reportApi() + '/v3.4/selInspectPositionEO?' + params
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
