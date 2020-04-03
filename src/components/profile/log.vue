<template>
  <div class="log">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>日志管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>操作人员</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.crew"></el-input>
            </div>
            <div class="item">
              <span>开始日期</span>
              <el-date-picker
                style="width: 160px;"
                v-model="nowSearch.startDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
              </el-date-picker>
            </div>
            <div class="item">
              <span>结束日期</span>
              <el-date-picker
                style="width: 160px;"
                v-model="nowSearch.endDate"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
              </el-date-picker>
            </div>
            <div class="operate"></div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>操作类型</span>
              <el-input style="width: 160px;" v-model="nowSearch.type"></el-input>
            </div>
            <div class="item">
              <span>所属模块</span>
              <el-input style="width: 160px;" v-model="nowSearch.module"></el-input>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="operation_user" width="200" label="操作人员"></el-table-column>
          <el-table-column prop="operation_type" width="200" label="操作类型"></el-table-column>
          <el-table-column label="操作时间" width="200">
            <template slot-scope="scope">
              <span>{{ scope.row.operation_time | formatDate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="with_module" width="200" label="所属模块"></el-table-column>
          <el-table-column prop="describe" :show-overflow-tooltip="true" label="描述"></el-table-column>
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
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default{
  name: 'log',
  data () {
    return {
      search: {
        crew: '',
        startDate: '',
        endDate: '',
        type: '',
        module: ''
      },
      nowSearch: {
        crew: '',
        startDate: '',
        endDate: '',
        type: '',
        module: ''
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10
    }
  },
  created () {
    // 设置全局项目禁用
    this.setProDisabled(true)
    // 设置初始化搜索时间
    this.nowSearch.startDate = this.$common.getNowDate()
    this.nowSearch.endDate = this.$common.getNowDate()
    this.getListData()
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setProDisabled'
    ]),
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      let startDate = ''
      if (this.search.startDate) {
        startDate = this.search.startDate + ' ' + '00:00:00'
      } else {
        startDate = this.$common.getNowDate() + ' ' + '00:00:00'
      }
      let endDate = ''
      if (this.search.endDate) {
        endDate = this.search.endDate + ' ' + '23:59:59'
      } else {
        endDate = this.$common.getNowDate() + ' ' + '23:59:59'
      }
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0,
        user_name: this.search.crew,
        start_time: startDate,
        end_time: endDate,
        type: this.search.type,
        module: this.search.module,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/selULog',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.ulogs
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
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.setProDisabled(false)
  }
}
</script>

<style lang="less" scoped>
.log{
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
    .module-main{
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .search{
        padding: 5px 0;
        .search-input{
          display: table;
          width: 100%;
          .item{
            display: table-cell;
            vertical-align: middle;
            width: 280px;
            font-size: 0;
            span{
              margin-right: 5px;
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
</style>
