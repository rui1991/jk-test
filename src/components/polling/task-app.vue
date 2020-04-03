<template>
  <el-dialog title="审批详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
    <el-form :model="formData" :label-width="formLabelWidth">
      <div class="two-form">
        <el-form-item class="item" label="申请人">
          <el-input :disabled="true" v-model="formData.appPerson"></el-input>
        </el-form-item>
        <el-form-item class="item" label="申请时间">
          <el-input :disabled="true" v-model="formData.appDate"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="审批人">
          <el-input :disabled="true" v-model="formData.exaPerson"></el-input>
        </el-form-item>
        <el-form-item class="item" label="审批状态">
          <el-input :disabled="true" v-model="formData.exaState"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="审批时间">
          <el-input :disabled="true" v-model="formData.exaDate"></el-input>
        </el-form-item>
        <el-form-item class="item" label="创建类型">
          <el-input :disabled="true" v-model="formData.creType"></el-input>
        </el-form-item>
      </div>
      <el-form-item label="申请原因" class="one-form">
        <el-input type="textarea" :disabled="true" v-model="formData.appCause"></el-input>
      </el-form-item>
      <el-form-item label="审批意见" class="one-form">
        <el-input type="textarea" :disabled="true" v-model="formData.exaOpinion"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentPro', 'parentId'],
  data () {
    return {
      formLabelWidth: '80px',
      formData: {
        appPerson: '',
        appDate: '',
        exaPerson: '',
        exaState: '',
        exaDate: '',
        creType: '',
        appCause: '',
        exaOpinion: ''
      }
    }
  },
  created () {

  },
  mounted () {

  },
  components: {

  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 初始化数据
    appInit () {
      // 获取详情
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        // company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.parentPro,
        apply_type: 0,
        from_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/audit/selAuditByFromID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 申请人
          const appPerson = itemData.apply_user_name
          // 申请时间
          const appDate = this.$common.formatDate(itemData.apply_time)
          // 审批人
          const exaPerson = itemData.audit_user_name || ''
          // 审批状态
          const stateNum = itemData.audit_state
          let exaState = ''
          if (stateNum === 0) {
            exaState = '未审批'
          } else if (stateNum === 1) {
            exaState = '通过'
          } else if (stateNum === 2) {
            exaState = '不通过'
          }
          // 审批时间
          const exaDate = this.$common.formatDate(itemData.audit_time)
          // 创建类型
          const creNum = itemData.apply_type
          let creType = ''
          if (creNum === 0) {
            creType = '巡检补卡'
          } else if (creNum === 1) {
            creType = '工单超时'
          } else if (creNum === 2) {
            creType = '考勤补卡'
          } else if (creNum === 3) {
            creType = '请假'
          }
          // 申请原因
          const appCause = itemData.apply_reason || ''
          // 审批意见
          const exaOpinion = itemData.audit_opinion || ''
          this.formData = {
            appPerson,
            appDate,
            exaPerson,
            exaState,
            exaDate,
            creType,
            appCause,
            exaOpinion
          }
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
        this.appInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
