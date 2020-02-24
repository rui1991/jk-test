<template>
  <div class="cipher">
    <div class="item">
      <div class="item-content">
        <span class="iconfont icon-yonghu"></span>
        <div class="item-input">
          <input type="text" class="input" v-model.trim="phone" placeholder="请输账号">
        </div>
      </div>
    </div>
    <div class="item">
      <div class="item-content">
        <span class="iconfont icon-mima"></span>
        <div class="item-input">
          <input type="password" class="input" v-model.trim="password" @keyup.enter.native= "enterEvent" placeholder="请输密码">
        </div>
      </div>
    </div>
    <div class="other">
      <el-checkbox v-model="checked" class="left save">记住密码</el-checkbox>
      <router-link :to="{ name: 'authcode'}" class="right switch">切换至验证码登录<i class="el-icon-d-arrow-right"></i></router-link>
    </div>
    <div class="login-btn">
      <el-button @click="verifyLogin">登  录</el-button>
    </div>
    <div class="loginHelp">
      <a href="javascript:void(0);" @click="skipFindpwd">忘记密码</a>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default{
  name: 'cipher',
  data () {
    return {
      phone: '',
      password: '',
      checked: false
    }
  },
  created () {

  },
  mounted () {
    // 获取账号
    const phone = localStorage.getItem('wxWebLoginPhone') || ''
    this.phone = phone
    // 获取密码
    const password = localStorage.getItem('wxWebLoginPwd') || ''
    // this.password = password
    // 获取记住密码状态
    const state = localStorage.getItem('wxWebSavePwdState')
    if (state === '1') {
      this.checked = true
      this.password = password
    } else {
      this.checked = false
      this.password = ''
    }
  },
  methods: {
    ...mapActions('user', [
      'setUserInfo',
      'setModAuthority',
      'setDetAuthority'
    ]),
    ...mapActions('other', [
      'setAllProject',
      'setNowProject',
      'setOrganTree',
      'setOrganData'
    ]),
    // 登录验证
    verifyLogin () {
      // 验证手机
      let phone = this.phone
      if (!phone) {
        this.$message({
          showClose: true,
          message: '请输入账号!',
          type: 'warning'
        })
        return
      }
      // 验证密码
      let password = this.password
      if (!password) {
        this.$message({
          showClose: true,
          message: '请输入密码!',
          type: 'warning'
        })
        return
      }
      this.loginSkip()
    },
    // 回车
    enterEvent () {
      // 验证手机
      let phone = this.phone
      if (!phone) {
        return
      }
      // 验证密码
      let password = this.password
      if (!password) {
        return
      }
      this.loginSkip()
    },
    // 登录跳转
    loginSkip () {
      let params = { type: 0, user_phone: this.phone, user_pwd: this.password }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/login',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 保存账号
          let phone = this.phone
          localStorage.setItem('wxWebLoginPhone', phone)
          // 保存密码
          if (this.checked) {
            localStorage.setItem('wxWebSavePwdState', '1')
            let password = this.password
            localStorage.setItem('wxWebLoginPwd', password)
          } else {
            localStorage.setItem('wxWebSavePwdState', '0')
            localStorage.setItem('wxWebLoginPwd', '')
          }
          // 存储登录返回数据
          const loginData = res.data.data1
          // 存储本次登录需要用到的数据
          // 存储Token
          let token = loginData.user.token
          sessionStorage.setItem('wxWebToken', token)
          // 存储公司ID
          let companyId = loginData.user.company_id
          // 存储公司名称
          let companyName = loginData.user.company_name
          // 存储用户ID
          let userId = loginData.user.user_id
          // 存储用户名称
          let userName = loginData.user.user_name
          // 存储用户角色id
          let roleId = loginData.user.role_id
          // 存储用户部门id
          let sectorId = loginData.user.ogz_id
          // 存储用户号码
          let userPhone = loginData.user.user_phone
          // 存储用户头像
          let userPhoto = loginData.user.head_picture || ''
          // 存储用户全部项目
          const allProject = loginData.projects
          // 判断是否有项目
          if (allProject.length === 0) {
            this.$message({
              showClose: true,
              message: '您还未分配项目，请联系管理员分配项目！',
              type: 'warning'
            })
            return
          }
          // 保存用户基本信息
          const info = {
            companyId,
            companyName,
            userId,
            userName,
            roleId,
            sectorId,
            userPhone,
            userPhoto
          }
          this.setUserInfo(info)
          // 保存所有项目
          this.setAllProject(allProject)
          // 保存用户当前项目
          let project = {}
          let nowProid = loginData.user.last_project || ''
          if (nowProid) {
            nowProid = Number.parseInt(nowProid)
            const nowProject = allProject.find(item => {
              return item.project_id === nowProid
            })
            if (nowProject) {
              project = {
                id: nowProid,
                name: nowProject.project_name,
                orgId: nowProject.organize_id,
                companyId: nowProject.company_id
              }
            } else {
              project = {
                id: nowProject[0].project_id,
                name: nowProject[0].project_name,
                orgId: nowProject[0].organize_id,
                companyId: nowProject[0].company_id
              }
            }
          }
          this.setNowProject(project)
          /* 存储权限 */
          const userAuts = loginData.permissions
          let authority = {
            organ: false,
            log: false,
            user: false,
            shift: false,
            scheduling: false,
            approval: false,
            site: false,
            plan: false,
            task: false,
            calendar: false,
            norm: false,
            abnormal: false,
            work: false,
            rule: false,
            polcard: false,
            polReport: false,
            workReport: false,
            videoSetting: false,
            videoPlaza: false,
            event: false
          }
          // 组织结构管理
          let autOrgan = []
          // 用户管理
          let autUser = []
          // 编制排班
          let autShift = []
          // 排班管理
          let autScheduling = []
          // 审批列表
          let autApproval = []
          // 地址管理
          let autSite = []
          // 巡检计划管理
          let autPlan = []
          // 巡检任务
          let autTask = []
          // 巡检日历
          let autCalendar = []
          // 巡检标准维护
          let autNorm = []
          // 巡检异常
          let autAbnormal = []
          // 工单列表
          let autWork = []
          // 异常处理规则设置
          let autRule = []
          // 巡检绑卡管理
          let autPolcard = []
          // 事件列表
          let autEvent = []
          userAuts.forEach(item => {
            if (item.function_id === 3 || item.function_id === 4 || item.function_id === 5) { // 组织结构管理
              authority.organ = true
              autOrgan.push(item.function_id)
            } else if (item.function_id === 18) { // 日志管理
              authority.log = true
            } else if (item.function_id === 15 || item.function_id === 16 || item.function_id === 17) { // 用户管理
              authority.user = true
              autUser.push(item.function_id)
            } else if (item.function_id === 26 || item.function_id === 27 || item.function_id === 28) { // 地址管理
              authority.site = true
              autSite.push(item.function_id)
            } else if (item.function_id === 30 || item.function_id === 31 || item.function_id === 34) { // 巡检计划管理
              authority.plan = true
              autPlan.push(item.function_id)
            } else if (item.function_id === 36 || item.function_id === 37 || item.function_id === 38 || item.function_id === 39) { // 巡检任务
              authority.task = true
              autTask.push(item.function_id)
            } else if (item.function_id === 40) { // 巡检日历
              authority.calendar = true
              autCalendar.push(item.function_id)
            } else if (item.function_id === 42 || item.function_id === 44 || item.function_id === 45) { // 巡检标准维护
              authority.norm = true
              autNorm.push(item.function_id)
            } else if (item.function_id === 47 || item.function_id === 181) { // 巡检异常
              authority.abnormal = true
              autAbnormal.push(item.function_id)
            } else if (item.function_id === 50 || item.function_id === 51 || item.function_id === 52 || item.function_id === 53 || item.function_id === 54) { // 工单列表
              authority.work = true
              autWork.push(item.function_id)
            } else if (item.function_id === 182 || item.function_id === 183 || item.function_id === 184) { // 异常处理规则设置
              authority.rule = true
              autRule.push(item.function_id)
            } else if (item.function_id === 187 || item.function_id === 188 || item.function_id === 189) { // 编制排班
              authority.shift = true
              autShift.push(item.function_id)
            } else if (item.function_id === 190 || item.function_id === 191) { // 排班管理
              authority.scheduling = true
              autScheduling.push(item.function_id)
            } else if (item.function_id === 62) { // 审批列表
              authority.approval = true
              autApproval.push(item.function_id)
            } else if (item.function_id === 21 || item.function_id === 22) { // 巡检绑卡管理
              authority.polcard = true
              autPolcard.push(item.function_id)
            } else if (item.function_id === 192) { // 巡检报表
              authority.polReport = true
            } else if (item.function_id === 193) { // 工单报表
              authority.workReport = true
            } else if (item.function_id === 206) { // 视频监控设置
              authority.videoSetting = true
            } else if (item.function_id === 207) { // 视频广场
              authority.videoPlaza = true
            } else if (item.function_id === 78 || item.function_id === 79 || item.function_id === 80 || item.function_id === 81 || item.function_id === 82) { // 事件列表
              authority.event = true
              autEvent.push(item.function_id)
            }
          })
          // 存储权限
          this.setModAuthority(authority)
          const autDet = {
            organ: autOrgan,
            user: autUser,
            shift: autShift,
            scheduling: autScheduling,
            approval: autApproval,
            site: autSite,
            plan: autPlan,
            task: autTask,
            calendar: autCalendar,
            norm: autNorm,
            abnormal: autAbnormal,
            work: autWork,
            rule: autRule,
            polcard: autPolcard,
            event: autEvent
          }
          this.setDetAuthority(autDet)
          // 保存机构树
          const orgTree = loginData.trees
          this.setOrganTree(orgTree)
          // 处理部门
          let orgData = this.initDisSecTree(JSON.parse(JSON.stringify(orgTree)))
          this.setOrganData(orgData)
          // 路由跳转
          this.$router.push({ path: '/main/home' })
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
    // 初始化处理部门
    initDisSecTree (treeData) {
      treeData.forEach((item, index, array) => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSecTree(item.children)
        }
      })
      return treeData
    },
    initRecSecTree (data) {
      data.forEach((item, index, array) => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecSecTree(item.children)
        }
      })
    },
    // 跳转找回密码
    skipFindpwd () {
      this.$router.push({ path: '/findpwd' })
    }
  }
}
</script>

<style lang="less" scoped>
  .cipher{
    .item{
      padding-bottom: 30px;
      .item-content{
        position: relative;
        height: 40px;
        .iconfont{
          position: absolute;
          width: 60px;
          height: 100%;
          left: 0;
          top: 0;
          background: #4fa5f2;
          border-radius: 6px;
          line-height: 40px;
          text-align: center;
          font-size: 24px;
          color: #ffffff;
        }
        .item-input{
          height: 100%;
          padding-left: 60px;
          background: #eaeef2;
          border-radius: 6px;
          .input{
            display: block;
            width: 100%;
            height: 100%;
            padding-left: 6px;
            font-size: 14px;
            color: #272727;
            border: none;
            background: transparent;
            -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          }
        }
      }
    }
    .other{
      height: 60px;
      color: #272727;
      .switch{
        font-size: 14px;
      }
    }
    .login-btn{
      height: 40px;
      .el-button{
        display: block;
        width: 100%;
        height: 100%;
        background: #4fa5f2;
        color: #ffffff;
        font-size: 16px;
        border: none;
        border-radius: 20px;
      }
    }
    .loginHelp{
      margin-top: 20px;
      text-align: right;
      font-size: 14px;
      color: #272727;
    }
  }
</style>
