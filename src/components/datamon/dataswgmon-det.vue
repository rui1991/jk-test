<template>
  <el-dialog title="数据网关心跳详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="messages" :show-overflow-tooltip="true" label="心跳内容"></el-table-column>
      <el-table-column prop="other_message" width="90" label="心跳状态"></el-table-column>
      <el-table-column label="心跳时间" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | formatDate }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * 参数说明：
 *  parentMac: 数据网关mac
 *  parentStartTime：开始时间
 *  parentEndTime：结束时间
* */
export default{
  props: ['parentDialog', 'parentMac', 'parentStartTime', 'parentEndTime'],
  data () {
    return {
      tableData: []
    }
  },
  methods: {
    detInit () {
      // 获取详情
      this.tableData = []
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        gw_mac: this.parentMac,
        start_time: this.parentStartTime,
        end_time: this.parentEndTime
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/manage/selGwHeartLogMes',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1.mes || []
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
