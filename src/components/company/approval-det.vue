<template>
  <el-dialog title="审批详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
    <el-form :model="formData" :label-width="formLabelWidth">
      <div class="two-form">
        <el-form-item class="item" label="项目名称">
          <el-input :disabled="true" v-model="formData.proName"></el-input>
        </el-form-item>
        <el-form-item class="item" label="申请人">
          <el-input :disabled="true" v-model="formData.creCrew"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="申请时间">
          <el-input :disabled="true" v-model="formData.cerTime"></el-input>
        </el-form-item>
        <el-form-item class="item" label="审批人">
          <el-input :disabled="true" v-model="formData.disCrew"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="审批状态">
          <el-input :disabled="true" v-model="formData.disState"></el-input>
        </el-form-item>
        <el-form-item class="item" label="审批时间">
          <el-input :disabled="true" v-model="formData.disTime"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="创建类型">
          <el-input :disabled="true" v-model="formData.creType"></el-input>
        </el-form-item>
        <el-form-item class="item" label="任务名称" v-if="formData.creTypeNum === 0">
          <el-input :disabled="true" v-model="formData.taskName"></el-input>
        </el-form-item>
        <el-form-item class="item" label="工单名称" v-else-if="formData.creTypeNum === 1">
          <el-input :disabled="true" v-model="formData.workName"></el-input>
        </el-form-item>
        <el-form-item class="item" label="请假类型" v-else-if="formData.creTypeNum === 3">
          <el-input :disabled="true" v-model="formData.leaveType"></el-input>
        </el-form-item>
        <el-form-item class="item" label="班次名称" v-else>
          <el-input :disabled="true" v-model="formData.shiftName"></el-input>
        </el-form-item>
      </div>
      <div class="two-form" v-if="formData.creTypeNum === 0">
        <el-form-item class="item" label="开始时间">
          <el-input :disabled="true" v-model="formData.taskStartTime"></el-input>
        </el-form-item>
        <el-form-item class="item" label="结束时间">
          <el-input :disabled="true" v-model="formData.taskEndTime"></el-input>
        </el-form-item>
      </div>
      <div class="two-form" v-else-if="formData.creTypeNum === 1">
        <el-form-item class="item" label="创建时间">
          <el-input :disabled="true" v-model="formData.workCreTime"></el-input>
        </el-form-item>
      </div>
      <div class="two-form" v-else-if="formData.creTypeNum === 3">
        <el-form-item class="item" label="开始时间">
          <el-input :disabled="true" v-model="formData.leaveStartTime"></el-input>
        </el-form-item>
        <el-form-item class="item" label="结束时间">
          <el-input :disabled="true" v-model="formData.leaveEndTime"></el-input>
        </el-form-item>
      </div>
      <div class="two-form" v-else>
        <el-form-item class="item" label="日期">
          <el-input :disabled="true" v-model="formData.shiftDate"></el-input>
        </el-form-item>
      </div>
      <el-form-item class="one-form" label="申请原因">
        <el-input :disabled="true" type="textarea" v-model="formData.cerCause"></el-input>
      </el-form-item>
      <el-form-item class="one-form" label="审批意见">
        <el-input :disabled="true" type="textarea" v-model="formData.disOpinion"></el-input>
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
      formLabelWidth: '100px',
      formData: {
        proName: '',
        creCrew: '',
        cerTime: '',
        disCrew: '',
        disState: '',
        disTime: '',
        creTypeNum: '',
        creType: '',
        taskName: '',
        workName: '',
        leaveType: '',
        shiftName: '',
        taskStartTime: '',
        taskEndTime: '',
        workCreTime: '',
        leaveStartTime: '',
        leaveEndTime: '',
        shiftDate: '',
        cerCause: '',
        disOpinion: ''
      }
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
    detInit () {
      this.formData = {
        proName: '',
        creCrew: '',
        cerTime: '',
        disCrew: '',
        disState: '',
        disTime: '',
        creTypeNum: '',
        creType: '',
        taskName: '',
        workName: '',
        leaveType: '',
        shiftName: '',
        taskStartTime: '',
        taskEndTime: '',
        workCreTime: '',
        leaveStartTime: '',
        leaveEndTime: '',
        shiftDate: '',
        cerCause: '',
        disOpinion: ''
      }
      this.getDetails()
    },
    // 查看详情
    getDetails () {
      let params = {
        // company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.parentPro,
        adt_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/audit/selAuditOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 申请时间
          const cerTime = this.$common.formatDate(itemData.apply_time)
          // 审批状态
          const disStateNum = itemData.audit_state
          let disState = ''
          if (disStateNum === 0) {
            disState = '未审批'
          } else if (disStateNum === 1) {
            disState = '通过'
          } else if (disStateNum === 2) {
            disState = '不通过'
          }
          // 审批时间
          const disTime = this.$common.formatDate(itemData.audit_time)
          // 创建类型
          const creTypeNum = itemData.apply_type
          let creType = ''
          // 任务名称
          let taskName = ''
          // 任务开始时间
          let taskStartTime = ''
          // 任务结束时间
          let taskEndTime = ''
          // 工单名称
          let workName = ''
          // 工单创建时间
          let workCreTime = ''
          // 请假类型
          let leaveType = ''
          // 请假开始时间
          let leaveStartTime = ''
          // 请假结束时间
          let leaveEndTime = ''
          // 班次名称
          let shiftName = ''
          // 班次日期
          let shiftDate = ''
          if (creTypeNum === 0) {
            creType = '巡检补卡'
            taskName = itemData.type_message.plan_name
            taskStartTime = this.$common.formatDate(itemData.type_message.start_time)
            taskEndTime = this.$common.formatDate(itemData.type_message.end_time)
          } else if (creTypeNum === 1) {
            creType = '工单超时'
            workName = itemData.type_message.wo_name
            workCreTime = this.$common.formatDate(itemData.type_message.create_time)
          } else if (creTypeNum === 2) {
            creType = '上班补卡'
            shiftName = itemData.type_message.work_name
            shiftDate = itemData.type_message.date
          } else if (creTypeNum === 3) {
            creType = '请假'
            const leaveTypeNum = itemData.type_message.leave_type
            if (leaveTypeNum === 0) {
              leaveType = '年休假'
            } else if (leaveTypeNum === 1) {
              leaveType = '病假'
            } else if (leaveTypeNum === 2) {
              leaveType = '事假'
            } else if (leaveTypeNum === 3) {
              leaveType = '婚假'
            } else if (leaveTypeNum === 4) {
              leaveType = '产假'
            } else if (leaveTypeNum === 5) {
              leaveType = '其他'
            }
            leaveStartTime = this.$common.formatDate(itemData.type_message.start_time)
            leaveEndTime = this.$common.formatDate(itemData.type_message.end_time)
          } else if (creTypeNum === 4) {
            creType = '下班补卡'
            shiftName = itemData.type_message.work_name
            shiftDate = itemData.type_message.date
          }
          this.formData = {
            proName: itemData.project_name,
            creCrew: itemData.apply_user_name,
            cerTime: cerTime,
            disCrew: itemData.audit_user_name || '',
            disState: disState,
            disTime: disTime,
            creTypeNum: creTypeNum,
            creType: creType,
            taskName: taskName,
            workName: workName,
            leaveType: leaveType,
            shiftName: shiftName,
            taskStartTime: taskStartTime,
            taskEndTime: taskEndTime,
            workCreTime: workCreTime,
            leaveStartTime: leaveStartTime,
            leaveEndTime: leaveEndTime,
            shiftDate: shiftDate,
            cerCause: itemData.apply_reason || '',
            disOpinion: itemData.audit_opinion || ''
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
        // 初始化详情
        this.detInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
