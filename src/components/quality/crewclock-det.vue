<template>
  <el-dialog title="未打卡详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column prop="atdate" label="日期"></el-table-column>
      <el-table-column prop="position_name" :show-overflow-tooltip="true" label="地址名称"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentPro', 'parentUid', 'parentState', 'parentStart', 'parentEnd'],
  data () {
    return {
      tableData: []
    }
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    detInit () {
      this.tableData = []
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        project_id: this.parentPro,
        user_id: this.parentUid,
        pos: this.parentState,
        start_date: this.parentStart,
        end_date: this.parentEnd,
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selRollCallReportNotPosition',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1.message
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
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.detInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
