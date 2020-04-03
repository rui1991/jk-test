<template>
  <div class="task-com">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检巡查</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/task">巡检任务</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>编辑巡检任务</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="nav-title">
          <el-steps :active="titleActive" align-center>
            <el-step title="填写基础信息"></el-step>
            <el-step title="选择地址"></el-step>
<!--            <el-step title="调整标准"></el-step>-->
            <el-step title="顺序调整"></el-step>
          </el-steps>
        </div>
        <div class="content">
          <task-basics
            :parentBasics="basicsForm"
            @parentBasicsFun="basicsFun"
            @parentCancelFun="cancelSkip"
            v-if="titleActive === 0"></task-basics>
          <plan-site
            :parentSite="siteForm"
            @parentSiteFun="siteFun"
            @parentActiveFun="activeFun"
            @parentCancelFun="cancelSkip"
            v-else-if="titleActive === 1"></plan-site>
<!--          <plan-norm-->
<!--            :parentSite="siteForm"-->
<!--            @parentActiveFun="activeFun"-->
<!--            @parentCancelFun="cancelSkip"-->
<!--            v-else-if="titleActive === 2"></plan-norm>-->
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
import taskBasics from '@/components/polling/task-basics'
// 引入选择地址
import planSite from '@/components/polling/plan-site'
// 引入调整标准
import planNorm from '@/components/polling/plan-norm'
// 引入顺序调整
import planOrder from '@/components/polling/plan-order'
export default{
  name: 'taskCom',
  data () {
    return {
      titleActive: 0,
      basicsForm: {
        name: '',
        sector: '',
        date: []
      },
      siteForm: {
        exetype: 1,
        positions: [],
        order: 0
      },
      taskId: '',
      planId: '',
      dutyId: '',
      btnState: false
    }
  },
  created () {
    // 设置全局项目禁用
    this.setProDisabled(true)
    // 保存任务ID
    this.taskId = this.$route.query.id
    // 获取计划详情
    setTimeout(() => {
      this.getPlanDetails()
    }, 100)
  },
  components: {
    taskBasics,
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
    // 获取计划详情
    getPlanDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        id_id: this.taskId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/v3.7.3/all/sel/selInsTaskOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 计划名称
          this.basicsForm.name = itemData.plan_name
          // 执行部门
          let sector = itemData.ogz_id
          sector ? sector = Number.parseInt(sector) : sector = ''
          this.basicsForm.sector = sector
          // 时间
          const startDate = this.$common.formatDate(itemData.start_time)
          const endDate = this.$common.formatDate(itemData.end_time)
          this.basicsForm.date = [startDate, endDate]
          // 点位顺序
          const order = itemData.po_desc
          this.siteForm.order = order
          // 点位
          const posData = itemData.pt_position
          let positions = []
          posData.forEach(item => {
            positions.push(item.position_id)
          })
          this.siteForm.positions = positions
          // 计划ID
          this.planId = itemData.plan_id
          // dutyID
          this.dutyId = itemData.duty_id
          // // 加载基本配置
          // this.titleActive = 0
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
    // 基本信息
    basicsFun (data) {
      this.basicsForm = data
      this.titleActive = 1
    },
    // 选择地址
    siteFun (data) {
      this.siteForm.positions = data
      this.titleActive = 3
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
      // 顺序
      const order = this.siteForm.order
      // 地址
      let positions = this.siteForm.positions
      positions = positions.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        id_id: this.taskId,
        plan_id: this.planId,
        duty_id: this.dutyId,
        plan_name: this.basicsForm.name,
        role_id: this.basicsForm.sector,
        start_time: this.basicsForm.date[0],
        end_time: this.basicsForm.date[1],
        po_desc: order,
        position_ids: positions
      }
      params = this.$qs.stringify(params)
      this.btnState = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/v3.7.3/all/alter/alterInsTask',
        data: params
      }).then((res) => {
        this.btnState = false
        if (res.data.result === 'Sucess') {
          this.$router.push({ path: '/main/task' })
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
      this.$router.push({ path: '/main/task' })
    }
  },
  beforeDestroy () {
    // 设置全局项目禁用
    this.setProDisabled(false)
  }
}
</script>

<style lang="less" scoped>
.task-com{
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
