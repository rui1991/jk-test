<template>
  <div class="code">
    <div class="item">
      <div class="item-content">
        <span class="iconfont iconshoujihao"></span>
        <div class="item-input">
          <input type="text" class="input" v-model.trim="phone" placeholder="请输手机号码">
        </div>
      </div>
    </div>
    <div class="item">
      <div class="item-content">
        <span class="iconfont iconyanzhengma"></span>
        <div class="item-input" style="margin-right: 120px;">
          <input type="text" class="input" v-model.trim="authCode" placeholder="">
        </div>
        <el-button type="primary" :disabled="codeDisabled" v-text="codeBtnText" @click="verifyPhone"></el-button>
      </div>
    </div>
    <div class="other">
      <router-link :to="{ name: 'cipher'}" class="switch">切换至密码登录<i class="el-icon-d-arrow-right"></i></router-link>
    </div>
    <div class="login-btn">
      <el-button @click="verifyLogin">登  录</el-button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default{
  name: 'authcode',
  data () {
    return {
      phone: '',
      authCode: '',
      saveCode: {authCode: '', phone: ''},
      codeDisabled: true,
      codeBtnText: '获取验证码',
      timer: null,
      proData: []
    }
  },
  created () {

  },
  methods: {
    ...mapActions('user', [
      'setUserInfo',
      'setModAuthority'
    ]),
    ...mapActions('other', [
      'setAllProject',
      'setNowProject',
      'setOrganTree',
      'setOrganData'
    ]),
    // 校验手机号码格式
    verifyPhone () {
      let phone = this.phone
      if (!phone) {
        this.$message({
          showClose: true,
          message: '请输入手机号码!',
          type: 'warning'
        })
        return
      }
      if (this.$common.checkPhone(phone)) {
        this.getVerifyCode()
      } else {
        this.$message({
          showClose: true,
          message: '手机号码格式有误!',
          type: 'warning'
        })
      }
    },
    // 获取验证码
    getVerifyCode () {
      let params = { user_phone: this.phone }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/apk/obtainPhoneCode',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 保存code
          this.saveCode = {
            authCode: res.data.data1.code,
            phone: res.data.data1.user_phone
          }
          // 设置按钮
          this.codeDisabled = true
          let count = 60
          this.timer = setInterval(() => {
            count--
            if (count > 0) {
              let codeBtnText = '还剩余' + count + '秒'
              this.codeBtnText = codeBtnText
            } else {
              this.codeBtnText = '获取验证码'
              this.codeDisabled = false
              clearInterval(this.timer)
            }
          }, 1000)
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
    // 登录验证
    verifyLogin () {
      // 验证手机
      let phone = this.phone
      if (phone) {
        if (!this.$common.checkPhone(phone)) {
          this.$message({
            showClose: true,
            message: '手机号码格式有误!',
            type: 'warning'
          })
          return
        }
      } else {
        this.$message({
          showClose: true,
          message: '请输入手机号码!',
          type: 'warning'
        })
        return
      }
      // 验证验证码
      let authCode = this.authCode
      if (!authCode) {
        this.$message({
          showClose: true,
          message: '请输入验证码!',
          type: 'warning'
        })
        return
      }
      let saveCode = this.saveCode.authCode
      let savePhone = this.saveCode.phone
      if (saveCode) {
        if (phone === savePhone && authCode === saveCode) {
          this.loginSkip()
        } else {
          this.$message({
            showClose: true,
            message: '验证码错误请重新输入！',
            type: 'warning'
          })
        }
      } else {
        this.$message({
          showClose: true,
          message: '请先获取验证码!',
          type: 'warning'
        })
      }
    },
    // 登录跳转
    loginSkip () {
      let params = { type: 1, user_phone: this.phone }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.2/login',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
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
          // 500, 501, 502, 503
          // 组织结构管理
          let autOrgan = false
          if (roleId === 500) {
            autOrgan = true
          }
          // 用户管理
          let autUser = false
          if (roleId !== 503) {
            autUser = true
          }
          const autDet = {
            organ: autOrgan,
            user: autUser
          }
          this.setModAuthority(autDet)
          // 保存机构树
          let orgTree = loginData.trees
          if (orgTree[0].organize_type === 0) {
            orgTree = orgTree[0].children
          }
          this.setOrganTree(orgTree)
          // 处理部门
          let orgData = this.recOrganData(JSON.parse(JSON.stringify(orgTree)))
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
    recOrganData (data) {
      data.forEach((item, index, array) => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.recOrganData(item.children)
        }
      })
      return data
    }
  },
  watch: {
    phone (newVal, oldVal) {
      if (newVal) {
        this.codeDisabled = false
      } else {
        this.codeDisabled = true
      }
    }
  },
  beforeDestroy () {
    clearInterval(this.timer)
  }
}
</script>

<style lang="less" scoped>
  .code{
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
        .el-button{
          position: absolute;
          right: 0;
          top: 0;
          height: 40px;
          font-size: 14px;
        }
      }
    }
    .other{
      height: 60px;
      color: #272727;
      font-size: 14px;
      text-align: right;
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
  }
</style>
