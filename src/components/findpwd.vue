<template>
  <div class="findpwd">
    <div class="header">
      <div class="header-in">
        <h3 class="title left">e掌巡智慧安全综合管理平台密码找回</h3>
        <a href="javascript:void(0);" class="skip right" @click="skipLogin">登 录</a>
      </div>
    </div>
    <div class="nav-title">
      <el-steps :active="titleActive" finish-status="success" align-center>
        <el-step title="验证手机号码"></el-step>
        <el-step title="设置新密码"></el-step>
        <el-step title="设置成功"></el-step>
      </el-steps>
    </div>
    <div class="content">
      <div class="content-item" v-if="titleActive === 0">
        <div class="input-item">
          <el-input
            type="text"
            size="large"
            placeholder="手机"
            prefix-icon="iconfont icon-shoujihao"
            v-model="phone">
          </el-input>
        </div>
        <div class="input-item">
          <el-input
            size="large"
            placeholder="验证码"
            prefix-icon="iconfont icon-yanzhengma"
            v-model="authCode"
            style="width: 60%">
          </el-input>
          <el-button type="primary" class="get-btn" :disabled="codeDisabled" v-text="codeBtnText" @click="verifyPhone"></el-button>
        </div>
        <div class="operate">
          <el-button type="primary" @click="skipSetPwd">下 一 步</el-button>
        </div>
      </div>
      <div class="content-item" v-else-if="titleActive === 1">
        <div class="input-item">
          <el-input
            size="large"
            type="password"
            placeholder="新密码"
            prefix-icon="iconfont icon-mima"
            v-model="pwdForm.newpwd1">
          </el-input>
        </div>
        <div class="input-item">
          <el-input
            size="large"
            type="password"
            placeholder="确认密码"
            prefix-icon="iconfont icon-mima"
            v-model="pwdForm.newpwd2">
          </el-input>
        </div>
        <div class="operate">
          <el-button type="primary" :disabled="comDisabled" @click="verifyPassword">确    定</el-button>
        </div>
      </div>
      <div class="succeed" v-else-if="titleActive === 2">
        <img src="../assets/images/suc-pwd.png" height="205" alt="">
        <div class="skip">
          <span class="blue" v-text="skipCount"></span>s后页面将自动跳转，如果没有跳转，<a href="javascript:void(0);" class="blue" @click="skipLogin">请点击这里</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default{
  name: 'findpwd',
  data () {
    return {
      titleActive: 0,
      phone: '',
      authCode: '',
      saveCode: {authCode: '', phone: ''},
      codeDisabled: true,
      codeBtnText: '获取验证码',
      timer: null,
      pwdForm: {
        phone: '',
        newpwd1: '',
        newpwd2: ''
      },
      comDisabled: false,
      skipTimer: null,
      skipCount: 5
    }
  },
  created () {

  },
  methods: {
    /* 验证手机号码 */
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
    // 跳转设置密码
    skipSetPwd () {
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
          this.pwdForm.phone = phone
          this.titleActive = 1
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
    /* 设置密码 */
    // 验证密码
    verifyPassword () {
      const phone = this.pwdForm.phone
      if (!phone) {
        this.titleActive = 0
        return
      }
      const newpwd1 = this.pwdForm.newpwd1
      if (newpwd1) {
        if (!this.checkPassword(newpwd1)) {
          this.$message({
            showClose: true,
            message: '密码必须为6-18位字母或数字',
            type: 'warning'
          })
          return
        }
      } else {
        this.$message({
          showClose: true,
          message: '新密码不能为空!',
          type: 'warning'
        })
        return
      }
      const newpwd2 = this.pwdForm.newpwd2
      if (newpwd2) {
        if (newpwd2 !== newpwd1) {
          this.$message({
            showClose: true,
            message: '两次输入密码不同请重新输入!',
            type: 'warning'
          })
          return
        }
      } else {
        this.$message({
          showClose: true,
          message: '请再次确认密码!',
          type: 'warning'
        })
        return
      }
      this.sendComPwd()
    },
    // 校验密码格式
    checkPassword (str) {
      let regex = /^[0-9a-zA-Z]\w{5,17}$/
      if (str.match(regex)) {
        return true
      } else {
        return false
      }
    },
    // 提交密码修改
    sendComPwd () {
      let params = {
        project_id: 0,
        user_phone: this.pwdForm.phone,
        login_pass: this.pwdForm.newpwd1
      }
      params = this.$qs.stringify(params)
      this.comDisabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/apk/updateUserPass',
        data: params
      }).then((res) => {
        this.comDisabled = false
        if (res.data.result === 'Sucess') {
          this.titleActive = 2
          // 设置跳转时间
          this.skipTimer = setInterval(() => {
            this.skipCount--
            if (this.skipCount <= 0) {
              this.skipLogin()
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
        this.comDisabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 跳转登录页
    skipLogin () {
      this.$router.push({ path: '/login/cipher' })
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
    clearInterval(this.skipTimer)
  }
}
</script>

<style lang="less" scoped>
.findpwd{
  .header{
    width: 100%;
    height: 100px;
    .header-in{
      width: 1200px;
      margin: 0 auto;
      .title{
        line-height: 100px;
        font-size: 24px;
        color: #333333;
      }
      .skip{
        line-height: 100px;
        font-size: 16px;
        color: #4e89c5;
      }
    }
  }
  .nav-title{
    width: 860px;
    padding: 20px;
    margin: 0 auto;
  }
  .content{
    padding: 20px;
    .content-item{
      width: 360px;
      margin: 20px auto;
      .input-item{
        margin-bottom: 40px;
        .get-btn{
          margin-left: 20px;
        }
      }
      .operate{
        button{
          display: block;
          width: 100%;
          background: #ff5a00;
          color: #ffffff;
          font-size: 16px;
          border: none;
          border-radius: 6px;
        }
      }
    }
    .succeed{
      margin-top: 20px;
      text-align: center;
      .skip{
        margin-top: 20px;
        font-size: 24px;
        text-align: center;
      }
    }
  }
}
</style>
