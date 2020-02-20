<template>
  <el-dialog title="位置打卡详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="360">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="user_name" width="80" label="人员"></el-table-column>
      <el-table-column prop="in_time" width="180" label="进入时间"></el-table-column>
      <el-table-column prop="out_time" width="180" label="离开时间"></el-table-column>
      <el-table-column prop="wait_time" label="停留时长(分)"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentDate'],
  data () {
    return {
      tableData: []
    }
  },
  computed: {
    ...mapState('other', [
      'projectId'
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
        project_id: this.projectId,
        now_date: this.parentDate,
        position_id: this.parentId,
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.8/selUserRecordPositionMs',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1.message || []
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
