<template>
  <el-dialog title="修改密码" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="small-dialog">
    <div v-if="showVerify">
      <el-form :model="formData" :rules="rules" ref="ruleOldForm" :label-width="formOldWidth">
        <el-form-item label="原密码" prop="old">
          <el-input type="password" v-model="formData.old" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div class="operate">
        <el-button type="primary" class="operate-btn" @click="verifyOldPwd('ruleOldForm')">验证密码</el-button>
        <el-button class="operate-btn" @click="resetForm('ruleOldForm')">取&nbsp;&nbsp;&nbsp;&nbsp;消</el-button>
      </div>
    </div>
    <div v-else>
      <el-form :model="formData" :rules="rules" ref="ruleNowForm" :label-width="formNowWidth">
        <el-form-item label="新密码" prop="now1">
          <el-input type="password" v-model="formData.now1" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="再次输入新密码" prop="now2">
          <el-input type="password" v-model="formData.now2" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div class="operate">
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleNowForm')">确 定</el-button>
        <el-button @click="resetForm('ruleNowForm')">取 消</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog'],
  data () {
    let checkPwd = (rule, value, callback) => {
      let regex = /^[0-9a-zA-Z]\w{5,17}$/
      if (value) {
        if (value.match(regex)) {
          callback()
        } else {
          callback(new Error('密码必须为6-18位字母或数字'))
        }
      } else {
        callback(new Error('请输入新密码'))
      }
    }
    let affirmPwd = (rule, value, callback) => {
      if (value) {
        const nowPwd = this.formData.now1
        if (value === nowPwd) {
          callback()
        } else {
          callback(new Error('两次输入不同，请核对后再输入'))
        }
      } else {
        callback(new Error('请再次输入新密码'))
      }
    }
    return {
      formOldWidth: '100px',
      formNowWidth: '130px',
      formData: {
        old: '',
        now1: '',
        now2: ''
      },
      rules: {
        old: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        now1: [
          { required: true, validator: checkPwd, trigger: 'blur' }
        ],
        now2: [
          { required: true, validator: affirmPwd, trigger: 'blur' }
        ]
      },
      showVerify: true,
      disabled: false
    }
  },
  created () {

  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId',
      'userPhone'
    ])
  },
  methods: {
    pwdInit () {
      this.formData = {
        old: '',
        now1: '',
        now2: ''
      }
      this.showVerify = true
    },
    // 重置表单
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.$emit('parentClose')
    },
    // 验证表单
    verifyOldPwd (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendOldVerify()
        } else {
          return false
        }
      })
    },
    // 提交旧密码验证
    sendOldVerify () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0,
        login_pass: this.formData.old
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/judgePWD',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.showVerify = false
        } else {
          this.$message({
            showClose: true,
            message: '您输入的原密码有误，请重新输入',
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
    // 验证表单
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendComPwd()
        } else {
          return false
        }
      })
    },
    // 提交密码修改
    sendComPwd () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0,
        user_phone: this.userPhone,
        login_pass: this.formData.now1
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/apk/updateUserPass',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 成功提示
          this.$message({
            showClose: true,
            message: '密码修改成功',
            type: 'success'
          })
          // 关闭模态框
          this.$emit('parentClose')
        } else {
          const errHint = this.$common.errorCodeHint(res.data.error_code)
          this.$message({
            showClose: true,
            message: errHint,
            type: 'error'
          })
        }
      }).catch(() => {
        this.disabled = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.pwdInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .small-dialog{
    .operate{
      text-align: center;
    }
  }
</style>
