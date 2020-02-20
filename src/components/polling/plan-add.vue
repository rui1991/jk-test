<template>
  <div class="plan-add">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检巡查</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/plan">巡检计划管理</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>新增巡检计划</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="nav-title">
          <el-steps :active="titleActive" align-center>
            <el-step title="填写基础信息"></el-step>
            <el-step title="选择地址"></el-step>
            <el-step title="调整标准"></el-step>
            <el-step title="顺序调整"></el-step>
          </el-steps>
        </div>
        <div class="content">
          <plan-basics
            :parentBasics="basicsForm"
            @parentBasicsFun="basicsFun"
            @parentCancelFun="cancelSkip"
            v-if="titleActive === 0"></plan-basics>
          <plan-site
            :parentSite="siteForm"
            @parentSiteFun="siteFun"
            @parentActiveFun="activeFun"
            @parentCancelFun="cancelSkip"
            v-else-if="titleActive === 1"></plan-site>
          <plan-norm
            :parentSite="siteForm"
            @parentActiveFun="activeFun"
            @parentCancelFun="cancelSkip"
            v-else-if="titleActive === 2"></plan-norm>
          <plan-order
            :parentSite="siteForm"
            :parentBtnState="btnState"
            @parentActiveFun="activeFun"
            @parentSaveFun="saveFun"
            @parentCancelFun="cancelSkip"
            v-else-if="titleActive === 3"></plan-order>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// 引入基础配置
import planBasics from '@/components/polling/plan-basics'
// 引入选择地址
import planSite from '@/components/polling/plan-site'
// 引入调整标准
import planNorm from '@/components/polling/plan-norm'
// 引入顺序调整
import planOrder from '@/components/polling/plan-order'
export default{
  name: 'planAdd',
  data () {
    return {
      titleActive: 0,
      basicsForm: {
        name: '',
        showExetype: true,
        exetype: 1,
        sector: '',
        group: '',
        date: [],
        pattern: 1,
        crewId: '',
        frequency: 1,
        unit: '天',
        degree: 1,
        crews: [{user_id: ''}],
        period: [],
        times: [{startTime: '00:00', endTime: '00:00', user_id: ''}]
      },
      siteForm: {
        exetype: 1,
        positions: [],
        order: 0
      },
      btnState: false
    }
  },
  created () {
    // 设置全局项目禁用
    this.setProDisabled(true)
  },
  components: {
    planBasics,
    planSite,
    planNorm,
    planOrder
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setProDisabled'
    ]),
    // 基本信息
    basicsFun (data) {
      this.basicsForm = data
      this.siteForm.exetype = data.exetype
      this.siteForm.positions = []
      this.titleActive = 1
    },
    // 选择地址
    siteFun (data) {
      this.siteForm.positions = data
      this.titleActive = 2
    },
    // 第几步
    activeFun (num) {
      this.titleActive = num
    },
    // 保存
    saveFun (data) {
      this.siteForm.positions = data.siteData
      this.siteForm.order = data.order
      this.sendAddRequest()
    },
    // 提交
    sendAddRequest () {
      // 执行日期
      let date = this.basicsForm.date
      const startDate = date[0]
      const endDate = date[1]
      // 频率
      let frequency = ''
      // 单位
      let unit = ''
      // 次数
      let degree = ''
      // 周期
      let period = []
      // 时间段
      let times = []
      // 人员
      let uids = ''
      // 任务模式
      let pattern = this.basicsForm.pattern
      if (pattern === 0) {
        // 频率
        frequency = this.basicsForm.frequency
        // 单位
        unit = this.basicsForm.unit
        // 次数
        degree = this.basicsForm.degree
        if (frequency === 1 && unit === '天') {
          // 周期
          period = this.basicsForm.period
          // 时间段
          const timeData = this.basicsForm.times
          // 人员
          let crews = []
          timeData.forEach(item => {
            let timeItem = item.startTime + '-' + item.endTime
            times.push(timeItem)
            let userItem = item.user_id || 0
            crews.push(userItem)
          })
          uids = crews.join(',')
        } else {
          let crewData = this.basicsForm.crews
          let crewIds = []
          crewData.forEach(item => {
            let crewItem = item.user_id || 0
            crewIds.push(crewItem)
          })
          uids = crewIds.join(',')
        }
      } else {
        // 执行人员
        uids = this.basicsForm.crewId || 0
      }
      // 周期
      period = period.join('/')
      // 时间段
      times = times.join('/')

      // 执行部门
      let sector = ''
      // 执行组
      let group = 0
      // 执行类型
      const exetype = this.basicsForm.exetype
      if (exetype === 1) {
        // 执行部门
        sector = this.basicsForm.sector
      } else {
        // 执行组
        group = this.basicsForm.group
      }
      // 顺序
      const order = this.siteForm.order
      // 地址
      let positions = this.siteForm.positions
      positions = positions.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        projectN_id: this.projectId,
        plan_name: this.basicsForm.name,
        ogz_id: sector,
        group_id: group,
        start_date: startDate,
        end_date: endDate,
        plan_model: pattern,
        frequency: frequency,
        unit: unit,
        frequency1: degree,
        cycle: period,
        times: times,
        userids: uids,
        po_desc: order,
        position_ids: positions
      }
      params = this.$qs.stringify(params)
      this.btnState = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/all/set/basicSet',
        data: params
      }).then((res) => {
        this.btnState = false
        if (res.data.result === 'Sucess') {
          this.$router.push({ path: '/main/plan' })
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.btnState = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 取消
    cancelSkip () {
      // 跳转
      this.$router.push({ path: '/main/plan' })
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.setProDisabled(false)
  }
}
</script>

<style lang="less" scoped>
.plan-add{
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
      .nav-title{
        width: 860px;
        padding: 20px;
        margin: 0 auto;
      }
      .content{
        padding: 20px;
      }
    }
  }
}
</style>
