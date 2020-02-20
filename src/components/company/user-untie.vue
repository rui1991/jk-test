<template>
  <el-dialog title="提示" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
    <p class="hint-text"><i class="el-icon-warning"></i>是否要解绑该用户与卡片之间的关联？</p>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentComId', 'parentPro', 'parentMac'],
  data () {
    return {
      formLabelWidth: '100px',
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
    // 提交
    submitClick () {
      let mac = this.formatCardMac(this.parentMac)
      let params = {
        company_id: this.parentComId,
        project_id: this.parentPro,
        user_id: this.userId,
        bind_user: this.parentId,
        card_mac: mac
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.5/releaseBind',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
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
      this.$emit('parentCancel')
    },
    // 格式化卡片mac
    formatCardMac (str) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      return value
    }
  }
}
</script>

<style lang="less" scoped>

</style>
