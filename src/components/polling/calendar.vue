<template>
  <div
    class="calendar"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检巡查</el-breadcrumb-item>
          <el-breadcrumb-item>巡检日历</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="date">
            <el-date-picker
              v-model="showDate"
              type="month"
              value-format="yyyy-MM"
              :clearable="false"
              @change="dateChange"
              :picker-options="pickerOptions"
              placeholder="选择月">
            </el-date-picker>
          </div>
        </div>
        <div class="calendar-table">
          <div class="rl-head clearfix">
            <div class="rl-table-th rl-table-item">星期日</div>
            <div class="rl-table-th rl-table-item">星期一</div>
            <div class="rl-table-th rl-table-item">星期二</div>
            <div class="rl-table-th rl-table-item">星期三</div>
            <div class="rl-table-th rl-table-item">星期四</div>
            <div class="rl-table-th rl-table-item">星期五</div>
            <div class="rl-table-th rl-table-item">星期六</div>
          </div>
          <div class="rl-body clearfix">
            <div class="rl-table-td rl-table-item minor" v-for="item in lastData" :key="item">
              <span class="sun">{{item}}</span>
            </div>
            <div class="rl-table-td rl-table-item nowMonth" :class="item.date === nowData ? 'active' : ''" v-for="(item, index) in calendarData" :key="item.date">
              <span class="sun">{{index+1}}</span>
              <router-link :to="{ path: '/main/calendar-item', query:{date: item.date, state: 0}}" class="accomplish" v-if="item.continueSize !== 0">完成：{{item.continueSize}}</router-link>
              <router-link :to="{ path: '/main/calendar-item', query:{date: item.date, state: 3}}" class="proceed" v-if="item.notContinueSize !== 0">未完成：{{item.notContinueSize}}</router-link>
              <router-link :to="{ path: '/main/calendar-item', query:{date: item.date, state: 4}}" class="await" v-if="item.abnormalSize !== 0">异常：{{item.abnormalSize}}</router-link>
            </div>
            <div class="rl-table-td rl-table-item minor" v-for="item in nextData" :key="item">
              <span class="sun">{{item}}</span>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  name: 'calendar',
  data () {
    return {
      loading: false,
      nowYear: '',
      nowMonth: '',
      nowData: this.$common.getNowDate(),
      showDate: '',
      lastData: [],
      calendarData: [],
      nextData: [],
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  created () {
    // 获取当前月份
    let mydata = new Date()
    let year = mydata.getFullYear()
    let month = mydata.getMonth() + 1 + ''
    month = month.padStart(2, '0')
    this.nowYear = year + ''
    this.nowMonth = month
    this.showDate = year + '-' + month
    // 获取数据
    this.getCalendarData()
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
    dateChange (date) {
      const dateArr = date.split('-')
      this.nowYear = dateArr[0]
      this.nowMonth = dateArr[1]
      this.getCalendarData()
    },
    getCalendarData () {
      this.loading = true
      let params = {}
      if (this.authority) {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          projectN_id: this.projectId,
          month_day: this.showDate
        }
      } else {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          projectN_id: this.projectId,
          month_day: this.showDate,
          ins_user: this.userId
        }
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsMonthCalendar',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const calendarData = res.data.data1
          this.showCalendarTable(calendarData)
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
    showCalendarTable (calendarData) {
      // 本月天数
      let daysCount = new Date(this.nowYear, this.nowMonth, 0).getDate()
      // 本月1号周几
      let monthstart = new Date(this.nowYear + '/' + this.nowMonth + '/1').getDay()
      // 上个月天数
      let lastMonth = ''
      if (this.nowMonth === 1) {
        lastMonth = new Date(this.nowYear - 1, 12, 0).getDate()
      } else {
        lastMonth = new Date(this.nowYear, this.nowMonth - 1, 0).getDate()
      }
      // 上个月的数据
      let lastData = []
      // 计算上个月空格数
      for (let i = monthstart; i > 0; i--) {
        lastData.push(lastMonth - i + 1)
      }
      this.lastData = lastData
      // 本月数据
      this.calendarData = calendarData
      // 计算下个月空格数
      let nextBlank = 42 - (daysCount + monthstart)
      let nextData = []
      for (let i = 0; i < nextBlank; i++) {
        nextData.push(i + 1)
      }
      this.nextData = nextData
    }
  }
}
</script>

<style lang="less" scoped>
.calendar{
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
        .date{
          display: table-cell;
          vertical-align:middle;
        }
      }
      .calendar-table{
        margin-top: 10px;
        height: 950px;
        .rl-table-item{
          float: left;
          width: 14.25%;
          font-size: 14px;
          border-left: 1px solid #e5e5e5;
          border-top: 1px solid #e5e5e5;
        }
        .rl-head{
          font-size: 0;
          .rl-table-th{
            height: 40px;
            line-height: 40px;
            text-align: center;
            background: #77a3cf;
            color: #fff;
          }
          .rl-table-th:nth-of-type(7){
            border-right: 1px solid #e5e5e5;
          }
        }
        .rl-body{
          border-bottom: 1px solid #e5e5e5;
          font-size: 0;
          .rl-table-td{
            height: 150px;
            &.minor{
              .sun{
                display: block;
                color: #e5e5e5;
              }
            }
            &.nowMonth{
              .sun{
                display: block;
                color: #444;
              }
              a{
                display: block;
                height: 30px;
                margin: 5px 5px 0;
                border: 1px solid #e5e5e5;
                border-radius: 4px;
                cursor: pointer;
                padding-left: 8px;
                line-height: 28px;
                font-size: 12px;
                color: #444;
                &.accomplish{
                  border-left: 4px solid #1dd943;
                }
                &.proceed{
                  border-left: 4px solid #420416;
                }
                &.await{
                  border-left: 4px solid #fa6b67;
                }
              }
              &.active{
                background: #f1f1f1;
              }
            }
          }
          .rl-table-td:nth-of-type(7n){
            border-right: 1px solid #e5e5e5;
          }
        }
      }
    }
  }
}
</style>
