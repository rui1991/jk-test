<template>
  <div class="calendar-item">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检巡查</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/calendar">巡检日历</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>巡检日历详情</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="item">
            <el-button type="primary" icon="iconfont icon-return" @click="returnBack">返回</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="任务名称">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row.id_id)">{{ scope.row.plan_name }}</a>
            </template>
          </el-table-column>
          <el-table-column label="执行部门">
            <template slot-scope="scope">
              <span v-if="scope.row.ogz_id">{{ scope.row.ogz_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="开始时间">
            <template slot-scope="scope">
              <span>{{ scope.row.start_time | filterDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="结束时间">
            <template slot-scope="scope">
              <span>{{ scope.row.end_time | filterDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="执行组/执行人">
            <template slot-scope="scope">
              <el-popover
                placement="top"
                :title="scope.row.group_name"
                trigger="click"
                :content="groupContent"
                v-if="scope.row.group_id">
                <a href="javascript:void(0);" slot="reference" class="blue" @click="getGrouoCrew(scope.row.group_id)">{{ scope.row.group_name }}</a>
              </el-popover>
              <span v-else>{{ scope.row.user_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="任务进度">
            <template slot-scope="scope">
              <span v-if="scope.row.continue_state === 1">未领取</span>
              <span v-else>已完成{{ scope.row.continue_process | formatPercent }}</span>
            </template>
          </el-table-column>
          <el-table-column label="审批状态">
            <template slot-scope="scope">
              <span v-if="scope.row.approval_state === 1">审批中</span>
              <span v-else-if="scope.row.approval_state === 2">通过</span>
              <span v-else-if="scope.row.approval_state === 3">不通过</span>
              <span v-else></span>
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
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentPro="projectId"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// 引入详情组件
import detModule from '@/components/polling/task-det'
export default{
  name: 'calendarItem',
  data () {
    return {
      tableData: [],
      groupContent: '',
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      itemId: ''
    }
  },
  created () {
    // 设置全局项目禁用
    this.setProDisabled(true)
    // 获取列表数据
    this.getListData()
  },
  components: {
    detModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('user', {
      authority: state => state.authority.calendar
    }),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setProDisabled'
    ]),
    getListData () {
      let params = {}
      if (this.authority) {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          projectN_id: this.projectId,
          planN_name: '',
          startN_date: this.$route.query.date,
          endN_date: this.$route.query.date,
          ogz_id: '',
          continueN_state: this.$route.query.state,
          userN_id: 0,
          page: this.nowPage,
          limit1: this.limit
        }
      } else {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          projectN_id: this.projectId,
          planN_name: '',
          startN_date: this.$route.query.date,
          endN_date: this.$route.query.date,
          ogz_id: '',
          continueN_state: this.$route.query.state,
          userN_id: this.userId,
          page: this.nowPage,
          limit1: this.limit
        }
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/all/sel/selInsTaskSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.insTask
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
        url: this.sysetApi() + '/v2.6/selUserByGroupId',
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
    /* 详情 */
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    // 返回上一级
    returnBack () {
      this.$router.go(-1)
    }
  },
  filters: {
    filterDate (str) {
      if (!str) { return '' }
      let value = new Date(parseInt(str))
      let month = value.getMonth() + 1 + ''
      month = month.padStart(2, '0')
      let day = value.getDate() + ''
      day = day.padStart(2, '0')
      let hour = value.getHours() + ''
      hour = hour.padStart(2, '0')
      let minutes = value.getMinutes() + ''
      minutes = minutes.padStart(2, '0')
      return `${month}-${day} ${hour}:${minutes}`
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.setProDisabled(false)
  }
}
</script>

<style lang="less" scoped>
.calendar-item{
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
        display: table;
        width: 100%;
        height: 60px;
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
      }
    }
  }
  .large-dialog{
    .det-operate {
      padding-right: 20px;
      height: 60px;
      text-align: right;
    }
    .el-collapse{
      border: 1px solid #cecece;
      padding: 10px;
      border-radius: 4px;
      .item{
        border-bottom: 1px solid #cecece;
        &:last-of-type{
          border-bottom: none;
        }
        .title{
          height: 30px;
          line-height: 30px;
          color: #272727;
        }
        .norm-hint{
          height: 35px;
          line-height: 34px;
        }
      }
    }
  }
}
</style>
