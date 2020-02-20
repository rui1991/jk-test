<template>
  <div
    class="posclockdet"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <div class="search">
      <div class="item">
        <el-date-picker
          v-model="searchDate"
          type="month"
          value-format="yyyy-MM"
          :clearable="false"
          @change="dateChange"
          :picker-options="pickerOptions"
          placeholder="选择月">
        </el-date-picker>
      </div>
      <div class="operate">
        <el-button type="primary" @click="crewClick">设置</el-button>
        <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
      </div>
    </div>
    <el-table class="list-table" :data="tableData" border style="width: 100%">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="user_name" fixed width="80" label="姓名" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="position_name" fixed width="150" :show-overflow-tooltip="true" label="位置名称"></el-table-column>
      <el-table-column label="日期">
        <el-table-column width="80" v-for="item in days" :label="item.date" :key="item.date">
          <template slot-scope="scope">
            <span v-if="scope.row.position_id === 0" class="red">-</span>
            <a href="javascript:void(0);" class="name" @click="detClick(scope.row.user_id, scope.row.position_id, item.value)" v-else-if="scope.row[item.value]">{{ scope.row[item.value] }}次</a>
            <span class="red" v-else-if="item.state">未打卡</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
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
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentUid="uId"
      :parentPos="posId"
      :parentDate="detDate"
      @parentClose="detClose">
    </det-module>
    <!-- 设置 -->
    <crew-module
      :parentDialog="crewDialog"
      :parentIds="crewId"
      @parentUpdata="crewUpdata"
      @parentCancel="crewCancel">
    </crew-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/quality/posclockdet-det'
// 引入设置组件
import crewModule from '@/components/public/crew-checkbox'
export default{
  name: 'posclockdet',
  data () {
    return {
      nowMonth: this.$common.getNowDate('yyyy-mm'),
      nowDay: 0,
      searchDate: this.$common.getNowDate('yyyy-mm'),
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      days: [],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      uId: 0,
      posId: 0,
      detDate: '',
      crewDialog: false,
      crewState: false,
      crewId: [],
      downDisabled: false,
      loading: false
    }
  },
  mounted () {
    // 日期
    const myDate = new Date()
    const year = myDate.getFullYear()
    const month = myDate.getMonth() + 1
    const nowDay = myDate.getDate()
    this.nowDay = nowDay
    // 本月天数
    let daysCount = new Date(year, month, 0).getDate()
    let days = []
    for (let i = 0; i < daysCount; i++) {
      let date = i + 1 + '日'
      let value = 'size' + (i + 1)
      let state = true
      if (nowDay <= i) {
        state = false
      }
      days.push(
        {
          date: date,
          value: value,
          state: state
        }
      )
    }
    this.days = days
    // 获取列表
    this.getListData()
  },
  components: {
    detModule,
    crewModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'projectId'
    ])
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        project_id: this.projectId,
        month: this.searchDate,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/selUserRecordMessageChildren',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.message
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
    // 选择时间
    dateChange (date) {
      let whether = false
      if (this.nowMonth === date) {
        whether = true
      }
      const dateArr = date.split('-')
      const year = dateArr[0]
      const month = dateArr[1]
      // 本月天数
      let daysCount = new Date(year, month, 0).getDate()
      let days = []
      for (let i = 0; i < daysCount; i++) {
        let date = i + 1 + '日'
        let value = 'size' + (i + 1)
        let state = true
        if (whether) {
          if (this.nowDay <= i) {
            state = false
          }
        }
        let item = {
          date: date,
          value: value,
          state: state
        }
        days.push(item)
      }
      this.days = days
      // 初始化页码
      this.nowPage = 1
      // 获取列表
      this.getListData()
    },
    /* 详情 */
    detClick (uid, posid, time) {
      this.uId = uid
      this.posId = posid
      let day = time.replace(/size/g, '')
      day = day.padStart(2, '0')
      this.detDate = this.searchDate + '-' + day
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 设置 */
    crewClick () {
      if (this.crewState) {
        this.crewDialog = true
        return
      }
      let params = {
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/selRollCallChildUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const checkCrew = res.data.data1
          let crewId = []
          checkCrew.forEach(item => {
            crewId.push(item.user_id)
          })
          this.crewId = crewId
          this.crewState = true
          this.crewDialog = true
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
    crewUpdata (data) {
      let crewId = data.ids
      crewId = crewId.join(',')
      let params = {
        user_id: this.userId,
        project_id: this.projectId,
        userids: crewId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/setRollCallChildUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewId = data.ids
          this.crewDialog = false
          // 初始化页码
          this.nowPage = 1
          // 获取列表数据
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
      this.crewDialog = false
    },
    crewCancel () {
      this.crewDialog = false
    },
    /* 导出 */
    downFile () {
      let params = {
        project_id: this.projectId,
        month: this.searchDate
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v3.7/selUserRecordMessageChildrenEO?' + params
    }
  },
  filters: {
    filterDate (str) {
      if (!str) { return '' }
      let value = new Date(Number.parseInt(str))
      let hour = value.getHours() + ''
      hour = hour.padStart(2, '0')
      let minutes = value.getMinutes() + ''
      minutes = minutes.padStart(2, '0')
      let seconds = value.getSeconds() + ''
      seconds = seconds.padStart(2, '0')
      return `${hour}:${minutes}:${seconds}`
    }
  }
}
</script>

<style lang="less" scoped>
.posclockdet{
  .search{
    display: table;
    width: 100%;
    height: 60px;
    .item{
      display: table-cell;
      vertical-align: middle;
    }
    .operate{
      display: table-cell;
      vertical-align: middle;
      text-align: right;
    }
  }
}
</style>
