<template>
  <div class="message">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>消息</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="operate">
            <el-button type="danger" @click="delDialog = true" :disabled="delDisabled">删除</el-button>
            <el-button type="primary" @click="setAllRead()">全部标为已读</el-button>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" @selection-change="handleSelectionChange" border style="width: 100%;">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column width="80" label="状态">
            <template slot-scope="scope">
              <i class="iconfont icon-noread" style="color: #569ade; cursor: default;" v-if="scope.row.state === 0"></i>
              <i class="iconfont icon-ready" style="color: #cccccc; cursor: default;" v-else-if="scope.row.state === 1"></i>
            </template>
          </el-table-column>
          <el-table-column width="180" label="标题">
            <template slot-scope="scope">
              <span>{{ scope.row.title | filterListTitle }}</span>
            </template>
          </el-table-column>
          <el-table-column label="内容">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row)">{{ scope.row.content }}</a>
            </template>
          </el-table-column>
          <el-table-column width="180" label="项目">
            <template slot-scope="scope">
              <span>{{ scope.row.project_name }}</span>
            </template>
          </el-table-column>
          <el-table-column width="180" label="时间">
            <template slot-scope="scope">
              <span>{{ scope.row.message_time | filterListTime }}</span>
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
    <!-- 审批详情 -->
    <app-module
      :parentDialog="appDialog"
      :parentPro="proId"
      :parentId="itemId"
      @parentClose="appClose">
    </app-module>
    <!-- 报表详情 -->
    <report-module
      :parentDialog="reportDialog"
      :parentPro="proId"
      :parentId="itemId"
      @parentClose="reportClose">
    </report-module>
    <!-- 任务详情 -->
    <task-module
      :parentDialog="taskDialog"
      :parentPro="proId"
      :parentId="itemId"
      @parentClose="taskClose">
    </task-module>
    <!-- 删除 -->
    <del-module
      :parentDialog="delDialog"
      :parentData="multipleSelection"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// 引入审批详情组件
import appModule from '@/components/company/approval-det'
// 引入报表详情组件
import reportModule from '@/components/profile/message-report'
// 引入任务详情组件
import taskModule from '@/components/polling/task-det'
// 引入删除组件
import delModule from '@/components/profile/message-del'
export default{
  name: 'message',
  data () {
    return {
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      delDisabled: true,
      delDialog: false,
      multipleSelection: [],
      proId: 0,
      itemId: 0,
      eventDialog: false,
      workDialog: false,
      appDialog: false,
      reportDialog: false,
      taskDialog: false
    }
  },
  created () {
    // 设置全局项目禁用
    this.setProDisabled(true)
  },
  mounted () {
    // 获取未读总数
    this.getUnreadSum()
    // 获取列表数据
    this.getListData()
  },
  components: {
    appModule,
    reportModule,
    taskModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setUnreadMes',
      'setProDisabled'
    ]),
    /*
    * type:
    * 0：事件
    * 1：工单
    * 2：审批
    * 3：报表
    * 5：审批
    * 7：任务
    * */
    // 获取未读总数
    getUnreadSum () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/findNrMyMessageTotal',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1[0]
          // 工作通知
          const workCount = itemData.workNrTotal || 0
          // e掌巡管理助手
          const helperCount = itemData.manageNrTotal || 0
          // e掌巡管理小秘书
          const clerkCount = itemData.secretaryNrTotal || 0
          // 总未读数
          const allCount = workCount + helperCount + clerkCount
          this.setUnreadMes(allCount)
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
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.4/selMyMessage',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.message
          // 清空选中项
          this.multipleSelection = []
          // 检验是否列表为空
          if (this.tableData.length === 0 && this.nowPage > 1) {
            this.nowPage--
            this.getListData()
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
    // 获取选中项
    handleSelectionChange (data) {
      this.multipleSelection = data
    },
    /* 全部已读 */
    setAllRead () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.4/myMessageAllRead',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.getUnreadSum()
          // 获取列表
          this.getListData()
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
    /* 消息详情 */
    detClick (data) {
      this.proId = data.project_id
      this.itemId = data.we_id
      // 消息类型
      const type = data.type
      // 状态
      const state = data.state
      if (state === 0) {
        this.setMesRead(data.m_id)
      }
      switch (type) {
        case 0:
          this.eventDialog = true
          break
        case 1:
          this.workDialog = true
          break
        case 2:
          this.appDialog = true
          break
        case 3:
          this.reportDialog = true
          break
        case 5:
          this.appDialog = true
          break
        case 7:
          this.taskDialog = true
          break
      }
    },
    // 设置消息已读
    setMesRead (id) {
      let params = {
        company_id: this.nowClientId,
        user_id: this.userId,
        m_ids: id,
        state: 1
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/lookMyMessage',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let tableData = this.tableData
          tableData.forEach(item => {
            if (item.m_id === id) {
              item.state = 1
            }
          })
          this.getUnreadSum()
        }
      }).catch(() => {

      })
    },
    /* 事件详情 */
    eventClose () {
      this.eventDialog = false
    },
    /* 工单详情 */
    workClose () {
      this.workDialog = false
    },
    /* 审批详情 */
    appClose () {
      this.appDialog = false
    },
    /* 报表详情 */
    reportClose () {
      this.reportDialog = false
    },
    /* 任务详情 */
    taskClose () {
      this.taskDialog = false
    },
    /* 删除 */
    delUpdata () {
      this.delDialog = false
      // 更新列表
      this.getListData()
    },
    delCancel () {
      this.delDialog = false
    }
  },
  filters: {
    filterListTitle (value) {
      if (!value) return ''
      const index = value.indexOf('（')
      if (index !== -1) {
        return value.substring(0, index)
      }
      return value
    },
    filterListTime (theDate) {
      const date = new Date()
      // 现在时间
      const nowdate = date.getTime()
      // 今天凌晨
      const today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      // 昨天凌晨
      const yestday = new Date(today - 24 * 3600 * 1000).getTime()
      let value = new Date(theDate)
      let year = value.getFullYear()
      let month = value.getMonth() + 1 + ''
      month = month.padStart(2, '0')
      let day = value.getDate() + ''
      day = day.padStart(2, '0')
      let hour = value.getHours() + ''
      hour = hour.padStart(2, '0')
      let minutes = value.getMinutes() + ''
      minutes = minutes.padStart(2, '0')
      let seconds = value.getSeconds() + ''
      seconds = seconds.padStart(2, '0')
      if (theDate < nowdate && theDate >= today) {
        return `${hour}:${minutes}:${seconds}`
      } else if (theDate < today && theDate >= yestday) {
        return `昨天 ${hour}:${minutes}:${seconds}`
      } else {
        return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
      }
    },
    filterReplyTime (value) {
      if (!value) return ''
      const index = value.indexOf('.')
      if (index !== -1) {
        return value.substring(0, index)
      }
      return value
    }
  },
  watch: {
    multipleSelection (newVal, oldVal) {
      if (newVal.length > 0) {
        this.delDisabled = false
      } else {
        this.delDisabled = true
      }
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.setProDisabled(false)
  }
}
</script>

<style lang="less">
.message{
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
        .operate{
          display: table-cell;
          vertical-align: middle;
        }
      }
    }
  }
}
</style>
