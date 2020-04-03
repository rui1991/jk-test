<template>
  <el-dialog title="计划详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
    <el-form :model="formData" :label-width="formLabelWidth">
      <el-form-item class="one-form" label="计划名称">
        <el-input :disabled="true" v-model="formData.name"></el-input>
      </el-form-item>
      <div class="two-form">
        <el-form-item class="item" label="所属项目">
          <el-input :disabled="true" v-model="formData.project"></el-input>
        </el-form-item>
        <el-form-item class="item" label="执行组" v-if="formData.group">
          <el-input :disabled="true" v-model="formData.group"></el-input>
        </el-form-item>
        <el-form-item class="item" label="执行部门" v-else>
          <el-input :disabled="true" v-model="formData.sector"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="开始日期">
          <el-input :disabled="true" v-model="formData.startDate"></el-input>
        </el-form-item>
        <el-form-item class="item" label="结束日期">
          <el-input :disabled="true" v-model="formData.endDate"></el-input>
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
    </el-form>
    <div class="content">
      <div class="item">
        <span class="item-title">任务模式</span>
        <p>{{formData.pattern}}</p>
      </div>
      <div class="item" v-if="!formData.group">
        <span class="item-title">执行频次</span>
        <p>{{formData.frequency}}</p>
      </div>
      <div class="task" v-if="!formData.whetherMore && !formData.group">
        <div class="task-item" v-for="(item, index) in formData.crews" :key="index">
          <span class="item-title">任务{{index+1}}</span>
          <el-input style="width: 200px;" :disabled="true" :value="item"></el-input>
        </div>
      </div>
      <div class="item" v-if="formData.whetherMore">
        <span class="item-title">周期</span>
        <p>{{formData.period}}</p>
      </div>
      <div class="frame" v-if="formData.whetherMore">
        <p class="item-title">执行时段</p>
        <div class="times">
          <div class="time" v-for="(item, index) in formData.timeFrame" :key="index">
            <div class="nape">
              <span class="nape-title">开始时间</span>
              <el-input style="width: 120px;" :disabled="true" :value="item.startTime"></el-input>
            </div>
            <div class="nape">
              <span class="nape-title">结束时间</span>
              <el-input style="width: 120px;" :disabled="true" v-model="item.endTime"></el-input>
            </div>
            <div class="nape" v-if="!formData.group">
              <span class="nape-title">执行人员</span>
              <el-input style="width: 120px;" :disabled="true" v-model="item.crew"></el-input>
            </div>
          </div>
        </div>
      </div>
      <div class="item" v-if="formData.whetherMore">
        <span class="item-title">巡检顺序</span>
        <p>{{formData.order}}</p>
      </div>
    </div>
    <el-collapse>
      <div class="item" v-for="(item, index) in formData.posData" :key="item.position_id">
        <p class="title" style="width: 580px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">{{item.position_name}}</p>
        <div v-if="item.template_id">
          <el-collapse-item :title="item.template_name" :name="index">
            <el-table class="show-table" :data="item.template.inss" style="width: 100%">
              <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
              <el-table-column prop="ins_method" label="检查方法" class-name="multi-row"></el-table-column>
              <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
              <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
            </el-table>
          </el-collapse-item>
        </div>
        <p class="norm-hint" v-else>无关联标准模板</p>
      </div>
    </el-collapse>
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
        name: '',
        project: '',
        sector: '',
        group: '',
        startDate: '',
        endDate: '',
        pattern: '',
        frequency: '',
        whetherMore: false,
        crews: [],
        period: '',
        timeFrame: [],
        order: '',
        posData: []
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
        name: '',
        project: '',
        sector: '',
        group: '',
        startDate: '',
        endDate: '',
        pattern: '',
        frequency: '',
        whetherMore: false,
        crews: [],
        period: '',
        timeFrame: [],
        order: '',
        posData: []
      }
      this.getDetails()
    },
    // 查看详情
    getDetails () {
      let params = {
        // company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.parentPro,
        plan_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/v3.7.3/selInsOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 计划名称
          this.formData.name = itemData.plan_name
          // 所属项目
          this.formData.project = this.nowProname
          // 操作角色
          this.formData.sector = itemData.ogz_name || ''
          // 操作组
          this.formData.group = itemData.group_name || ''
          // 开始日期
          this.formData.startDate = itemData.start_date
          // 结束日期
          this.formData.endDate = itemData.end_date
          // 任务模式
          const patternNum = itemData.plan_model
          let pattern = ''
          // 频次
          let frequency = ''
          // 是否一天多次
          let whetherMore = false
          if (patternNum === 0) {
            pattern = '循环任务'
            // 频率
            const freNum = itemData.frequency
            // 单位
            const unit = itemData.unit
            // 次数
            const degree = itemData.frequency1
            frequency = freNum + unit + degree + '次'
            // 是否一天多次
            if (freNum === 1 && unit === '天') {
              whetherMore = true
            }
          } else if (patternNum === 1) {
            pattern = '单次任务'
          }
          this.formData.pattern = pattern
          // 频次
          this.formData.frequency = frequency
          // 是否一天多次
          this.formData.whetherMore = whetherMore
          // 人员
          const crewData = itemData.users
          let crews = []
          crewData.forEach(item => {
            crews.push(item.user_name)
          })
          this.formData.crews = crews
          // 周期
          let periodNum = itemData.cycle
          if (periodNum) {
            periodNum = periodNum.split('/')
          } else {
            periodNum = []
          }
          const periodAry = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
          let period = []
          periodNum.forEach(item => {
            let num = parseInt(item)
            period.push(periodAry[num])
          })
          period = period.join(' ')
          this.formData.period = period
          // 时段
          let timeFrame = []
          let times = itemData.times
          times = times.split('/')
          times.forEach((item, index) => {
            const timeItem = item.split('-')
            const timeFrameItem = {
              startTime: timeItem[0],
              endTime: timeItem[1],
              crew: crews[index]
            }
            timeFrame.push(timeFrameItem)
          })
          this.formData.timeFrame = timeFrame
          // 点位顺序
          const orderNum = itemData.po_desc
          let order = ''
          if (orderNum === 0) {
            order = '随机顺序'
          } else if (orderNum === 1) {
            order = '固定顺序'
          }
          this.formData.order = order
          // 点位
          let position = itemData.positions
          position = position.join(',')
          this.formData.posData = []
          this.getPosData(position)
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
    // 地址
    getPosData (ids) {
      let params = {
        // company_id: this.nowClientId,
        user_id: this.userId,
        project_id: this.parentPro,
        position_ids: ids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/selInsSetPositionsTemplate',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.formData.posData = res.data.data1
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
        // 初始化数据
        this.detInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.plan{
  height: 100%;
  .module-container{
    height: 100%;
    padding: 0;
    .module-header{
      padding-left: 0;
      padding-right: 0;
      padding-bottom: 20px;
      .el-breadcrumb{
        padding-top: 15px;
        padding-left: 20px;
        padding-bottom: 15px;
        background: #ffffff;
      }
    }
    .module-main{
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .search{
        padding: 5px 0;
        .search-input{
          display: table;
          width: 100%;
          .item{
            display: table-cell;
            vertical-align: middle;
            width: 280px;
            font-size: 0;
            span{
              width: 70px;
              display: inline-block;
              line-height: 34px;
              font-size: 14px;
            }
          }
          .operate{
            display: table-cell;
            vertical-align: middle;
            text-align: right;
          }
        }
      }
    }
  }
  .large-dialog{
    .el-dialog__body{
      max-height: 480px;
      overflow: auto;
      .content{
        .item{
          font-size: 0;
          margin-bottom: 15px;
          .item-title{
            display: inline-block;
            width: 100px;
            padding-right: 12px;
            text-align: right;
            font-size: 14px;
          }
          p{
            display: inline-block;
            font-size: 14px;
          }
        }
        .task{
          margin-bottom: 15px;
          .task-item{
            margin-bottom: 10px;
            .item-title{
              display: inline-block;
              width: 100px;
              padding-right: 12px;
              line-height: 34px;
              text-align: right;
            }
          }
        }
        .frame{
          margin-bottom: 15px;
          padding-left: 30px;
          .item-title{
            height: 34px;
            line-height: 34px;
          }
          .time{
            font-size: 0;
            .nape{
              display: inline-block;
              width: 200px;
              .nape-title{
                margin-right: 5px;
                line-height: 45px;
                font-size: 14px;
              }
            }
          }
        }
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
  }
}
</style>
