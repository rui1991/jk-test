<template>
  <el-dialog title="选择告警推送人" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-transfer
      v-model="checkedCrews"
      :data="crewList"
      :props="props"
      filterable
      :titles="['未选择', '已选择']">
    </el-transfer>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog'],
  data () {
    return {
      crewList: [],
      checkedCrews: [],
      props: {
        key: 'user_id',
        label: 'user_name'
      },
      disabled: false
    }
  },
  created () {

  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
    // 初始化数据
    warnInit () {
      if (this.crewList.length === 0) {
        // 获取全部人员
        this.getCrewOptions()
      } else {
        // 获取告警人
        this.getLinkman()
      }
    },
    // 获取项目人员
    getCrewOptions () {
      let params = {
        organize_id: this.projectOrgId,
        user_name: '',
        user_phone: '',
        role_id: '',
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewList = res.data.data1.users
          // 获取告警人
          this.getLinkman()
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
    // 获取告警人
    getLinkman () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selDevicePush',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const linkman = res.data.data1
          let checkedCrews = []
          linkman.forEach(item => {
            checkedCrews.push(item.user_id)
          })
          this.checkedCrews = checkedCrews
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
    // 取消
    cancelClick () {
      this.$emit('parentClose')
    },
    // 确定
    confirmClick () {
      let checkedCrews = this.checkedCrews
      let uids = checkedCrews.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        user_ids: uids
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/setDevicePush',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            message: '告警推送人员设置成功！',
            type: 'success'
          })
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
        this.warnInit()
      }
    },
    checkedCrews (val, oldVal) {
      if (val.length === 0) {
        this.disabled = true
      } else {
        this.disabled = false
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
