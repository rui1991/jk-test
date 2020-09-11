<template>
  <el-dialog :title="modTitle" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420" v-if="parentFacType === 'collector'">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="user_name" :show-overflow-tooltip="true" label="人员"></el-table-column>
      <el-table-column label="采集器MAC">
        <template slot-scope="scope">
          <span>{{ scope.row.card_mac | formatMac }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420" v-else-if="parentFacType === 'position'">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="position_name" :show-overflow-tooltip="true" label="地址名称"></el-table-column>
      <el-table-column label="点位MAC">
        <template slot-scope="scope">
          <span>{{ scope.row.position_mac | formatMac }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="420" v-else-if="parentFacType === 'dataswg'">
      <el-table-column type="index" fixed width="50" label="序号"></el-table-column>
      <el-table-column prop="gw_name" :show-overflow-tooltip="true" label="网关名称"></el-table-column>
      <el-table-column label="网关MAC">
        <template slot-scope="scope">
          <span>{{ scope.row.gw_mac | formatMac }}</span>
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
 *  type: 1当天    3近三天
 *  facType：    collector数据采集器     position地址设备       dataswg数据网关
* */
export default{
  props: ['parentDialog', 'parentPro', 'parentType', 'parentFacType'],
  data () {
    return {
      modTitle: '项目异常设备详情',
      reqApiName: '',
      tableData: []
    }
  },
  methods: {
    detInit () {
      const facType = this.parentFacType
      switch (facType) {
        case 'collector':
          this.modTitle = '项目异常数据采集器详情'
          this.reqApiName = '/selProAbnormalDataCardMess'
          break
        case 'position':
          this.modTitle = '项目异常地址设备详情'
          this.reqApiName = '/selProAbnormalDataPoMess'
          break
        case 'dataswg':
          this.modTitle = '项目异常数据网关详情'
          this.reqApiName = '/selProAbnormalGatewayMess'
          break
      }
      // 获取详情
      this.tableData = []
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        project_id: this.parentPro,
        type: this.parentType
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/manage' + this.reqApiName,
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
