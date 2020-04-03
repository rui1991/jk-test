<template>
  <el-dialog title="用户绑卡" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="卡片MAC" prop="mac">
        <el-input v-model.trim="formData.mac" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentComId', 'parentPro'],
  data () {
    let checkMac = (rule, value, callback) => {
      const formValue = value.replace(/:/g, '')
      let regex1 = /^[a-zA-Z0-9]{12}$/
      let regex2 = /^[a-zA-Z0-9]{16}$/
      if (formValue) {
        if (formValue.match(regex1) || formValue.match(regex2)) {
          callback()
        } else {
          callback(new Error('你输入的mac地址格式有误，请认真核对'))
        }
      } else {
        callback(new Error('请输入mac地址'))
      }
    }
    return {
      formLabelWidth: '100px',
      formData: {
        mac: ''
      },
      rules: {
        mac: [
          { required: true, validator: checkMac, trigger: 'blur' }
        ]
      },
      disabled: false
    }
  },
  created () {

  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 初始化数据
    bindInit () {
      this.formData = {
        mac: ''
      }
    },
    // 验证表单
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    // 提交
    sendRequest () {
      let mac = this.formatCardMac(this.formData.mac)
      let params = {
        company_id: this.parentComId,
        project_id: this.parentPro,
        user_id: this.userId,
        bind_user: this.parentId,
        card_mac: mac,
        type: '1'
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.5/setCardBind',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetForm('ruleForm')
          // 刷新列表
          this.$emit('parentUpdata')
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
    },
    // 取消
    cancelClick () {
      // 重置表单
      this.resetForm('ruleForm')
      this.$emit('parentCancel')
    },
    // 格式化卡片mac
    formatCardMac (str) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      return value
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.bindInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
