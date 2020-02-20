<template>
  <el-dialog title="提示" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="hint-dialog">
    <p class="hint-text"><i class="el-icon-warning"></i>是否要删除该消息？</p>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentData'],
  data () {
    return {
      disabled: false
    }
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId'
    ])
  },
  methods: {
    // 提交
    submitForm () {
      const parentData = this.parentData
      let ids = []
      parentData.forEach(item => {
        ids.push(item.m_id)
      })
      ids = ids.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        m_ids: ids,
        state: 2
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/lookMyMessage',
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
    }
  }
}
</script>

<style lang="less">

</style>
