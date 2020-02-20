<template>
  <div>
    <el-dialog title="任务详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
      <div class="det-operate">
        <el-button type="primary" :disabled="downDisabled" @click="downTask">导出巡检任务</el-button>
        <el-button type="primary" v-if="formData.exaState !== undefined" @click="appDialog = true">查看审批详情</el-button>
      </div>
      <el-form :model="formData" :label-width="formLabelWidth">
        <div class="two-form">
          <el-form-item class="item" label="任务名称">
            <el-input :disabled="true" v-model="formData.name"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行部门">
            <el-input :disabled="true" v-model="formData.sector"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item :disabled="true" class="item" label="执行时段">
            <el-input :disabled="true" v-model="formData.startDate"></el-input>
          </el-form-item>
          <el-form-item class="item" label="————">
            <el-input :disabled="true" v-model="formData.endDate"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="执行组" v-if="formData.group">
            <el-input :disabled="true" v-model="formData.group"></el-input>
          </el-form-item>
          <el-form-item class="item" label="执行人" v-else>
            <el-input :disabled="true" v-model="formData.person"></el-input>
          </el-form-item>
          <el-form-item class="item" label="任务进度">
            <el-input :disabled="true" v-model="formData.taskDegree"></el-input>
          </el-form-item>
        </div>
        <div class="two-form">
          <el-form-item class="item" label="巡查顺序">
            <el-input :disabled="true" v-model="formData.desc"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <el-collapse v-show="formData.posData.length > 0">
        <div class="item" v-for="(item, index) in formData.posData" :key="item.position_id">
          <p class="clearfix title">
            <span class="site left">{{item.position_name}}</span>
            <span class="time right">{{item.check_time | formatDate}}</span>
          </p>
          <el-collapse-item :title="item.template_name" :name="index" v-if="item.insPo">
            <el-table class="show-table" :data="item.insPo" style="width: 100%">
              <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
              <el-table-column prop="method" label="检查方法" class-name="multi-row"></el-table-column>
              <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
              <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
              <el-table-column label="检查结果" width="80">
                <template slot-scope="scope">
                  <span v-if="scope.row.task_state === 0">未巡查</span>
                  <span v-else-if="scope.row.task_state === 1">正常</span>
                  <span v-else-if="scope.row.task_state === 2">异常</span>
                  <span v-else></span>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <p class="norm-hint" v-else>无关联标准模板</p>
        </div>
      </el-collapse>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeClick">关 闭</el-button>
      </div>
    </el-dialog>
    <!-- 审批详情 -->
    <app-module
      :parentDialog="appDialog"
      :parentPro="parentPro"
      :parentId="parentId"
      @parentClose="appClose">
    </app-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import appModule from '@/components/polling/task-app'
export default{
  props: ['parentDialog', 'parentPro', 'parentId'],
  data () {
    return {
      formLabelWidth: '80px',
      formData: {
        name: '',
        role: '',
        startDate: '',
        endDate: '',
        group: '',
        person: '',
        taskDegree: '',
        desc: '',
        posData: [],
        exaState: undefined
      },
      downDisabled: false,
      appDialog: false
    }
  },
  created () {

  },
  mounted () {

  },
  components: {
    appModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 初始化数据
    detInit () {
      // 获取详情
      this.getDetails()
      // 可导出
      this.downDisabled = false
    },
    // 获取详情
    getDetails () {
      let params = {
        user_id: this.userId,
        project_id: this.parentPro,
        id_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/all/sel/selInsTaskOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 开始时间
          const startDate = this.$common.formatDate(itemData.start_time)
          // 结束时间
          const endDate = this.$common.formatDate(itemData.end_time)
          // 任务进度
          const state = itemData.continue_state
          let taskDegree = ''
          if (state === 1) {
            taskDegree = '未领取'
          } else {
            // 完成度
            const degree = this.$common.formatNum(itemData.continue_process) * 1000 / 10 + '%'
            taskDegree = '已完成' + degree
          }
          // 巡查顺序
          const descNum = itemData.po_desc
          let desc = ''
          if (descNum === 0) {
            desc = '随机顺序'
          } else if (descNum === 1) {
            desc = '固定顺序'
          }
          // 审批状态
          const exaState = itemData.approval_state || undefined
          this.formData = {
            name: itemData.plan_name,
            sector: itemData.ogz_name || '',
            startDate: startDate,
            endDate: endDate,
            group: itemData.group_name || '',
            person: itemData.user_name || '',
            taskDegree: taskDegree,
            desc: desc,
            posData: itemData.pt_position,
            exaState: exaState
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
    },
    // 导出
    downTask () {
      let params = {
        user_id: this.userId,
        project_id: this.parentPro,
        id_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/inspection/iDEximport?' + params
    },
    /* 审批详情 */
    appClose () {
      this.appDialog = false
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
  .large-dialog{
    .det-operate {
      padding-right: 20px;
      height: 60px;
      text-align: right;
    }
    .el-collapse{
      border: 1px solid #cecece;
      padding: 10px;
      border-radius: 4px;
      .item{
        border-bottom: 1px solid #cecece;
        &:last-of-type{
          border-bottom: none;
        }
        .title{
          height: 30px;
          line-height: 30px;
          color: #272727;
        }
        .norm-hint{
          height: 35px;
          line-height: 34px;
        }
      }
    }
  }
</style>
