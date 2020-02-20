<template>
  <el-dialog title="报表详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog">
    <div class="report-item" v-if="taskShow">
      <Chart :parOption="taskOption" class="report-chart" id="taskChart" :domWidth="domWidth"></Chart>
      <el-table class="select-table" :data="taskTable" width="100%" :span-method="mergeLineMethod">
        <el-table-column prop="sum" label="总数"></el-table-column>
        <el-table-column label="图例">
          <template slot-scope="scope">
            <span class="dice finish" v-if="scope.row.legend === 1"></span>
            <span class="dice undone" v-else-if="scope.row.legend === 2"></span>
            <span class="dice abnormal" v-else-if="scope.row.legend === 3"></span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量"></el-table-column>
        <el-table-column prop="percent" label="占比"></el-table-column>
      </el-table>
    </div>
    <div class="report-item" v-if="workShow">
      <Chart :parOption="workOption" class="report-chart" id="workChart" :domWidth="domWidth"></Chart>
      <el-table class="select-table" :data="workTable" :span-method="mergeLineMethod">
        <el-table-column prop="sum" label="总数"></el-table-column>
        <el-table-column label="图例">
          <template slot-scope="scope">
            <span class="dice finish" v-if="scope.row.legend === 1"></span>
            <span class="dice undone" v-else-if="scope.row.legend === 2"></span>
            <span class="dice abnormal" v-else-if="scope.row.legend === 3"></span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量"></el-table-column>
        <el-table-column prop="percent" label="占比"></el-table-column>
      </el-table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
// 引入chart
import Chart from '@/components/public/chart'
export default{
  props: ['parentDialog', 'parentPro', 'parentId'],
  data () {
    return {
      domWidth: 100,
      taskShow: false,
      taskOption: {
        title: {
          text: '',
          textStyle: {
            color: '#666',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: 14
          },
          left: 'left'
        },
        legend: {
          bottom: 0,
          left: 'center',
          data: ['已完成', '未完成', '异常']
        },
        series: [
          {
            name: '巡检任务',
            type: 'pie',
            radius: '55%',
            data: []
          }
        ],
        color: ['#b7dd73', '#ffdb8a', '#fa6b67']
      },
      taskTable: [],
      workShow: false,
      workOption: {
        title: {
          text: '',
          textStyle: {
            color: '#666',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: 14
          },
          left: 'left'
        },
        legend: {
          bottom: 0,
          left: 'center',
          data: ['已完成', '未完成', '异常']
        },
        series: [
          {
            name: '巡检任务',
            type: 'pie',
            radius: '55%',
            data: []
          }
        ],
        color: ['#b7dd73', '#ffdb8a', '#fa6b67']
      },
      workTable: []
    }
  },
  components: {
    Chart
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId'
    ])
  },
  methods: {
    detInit () {
      this.taskShow = false
      this.taskOption.title.text = ''
      this.taskOption.series[0].data = []
      this.taskTable = []
      this.workShow = false
      this.taskOption.title.text = ''
      this.taskOption.series[0].data = []
      this.workTable = []
      // 获取详情
      this.getDetails()
    },
    getDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.parentPro,
        rpt_ids: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/report/selReportByID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let listData = res.data.data1
          // 巡检
          let taskShow = false
          let taskTitle = ''
          let taskTable = []
          // 工单
          let workShow = false
          let workTitle = ''
          let workTable = []
          listData.forEach(item => {
            if (item.report_type === 0) {
              taskShow = true
              taskTitle = '巡检报表（' + item.start_date + ' — ' + item.end_date + '）'
              taskTable = [
                {
                  sum: item.all_size,
                  legend: 1,
                  quantity: item.continueSize,
                  percent: item.c_rate
                },
                {
                  sum: item.all_size,
                  legend: 2,
                  quantity: item.nocontinue,
                  percent: item.n_rate
                },
                {
                  sum: item.all_size,
                  legend: 3,
                  quantity: item.abnormal,
                  percent: item.a_rate
                }
              ]
            } else if (item.report_type === 1) {
              workShow = true
              workTitle = '工单报表（' + item.start_date + ' — ' + item.end_date + '）'
              workTable = [
                {
                  sum: item.all_size,
                  legend: 1,
                  quantity: item.continueSize,
                  percent: item.c_rate
                },
                {
                  sum: item.all_size,
                  legend: 2,
                  quantity: item.nocontinue,
                  percent: item.n_rate
                },
                {
                  sum: item.all_size,
                  legend: 3,
                  quantity: item.abnormal,
                  percent: item.a_rate
                }
              ]
            }
          })
          this.taskShow = taskShow
          this.taskTable = taskTable
          this.workShow = workShow
          this.workTable = workTable
          if (taskShow) {
            const chartData = [
              {value: this.taskTable[0].quantity, name: '已完成'},
              {value: this.taskTable[1].quantity, name: '未完成'},
              {value: this.taskTable[2].quantity, name: '异常'}
            ]
            setTimeout(() => {
              this.taskOption.title.text = taskTitle
              this.taskOption.series[0].data = chartData
            }, 100)
          }
          if (workShow) {
            const chartData = [
              {value: this.workTable[0].quantity, name: '已完成'},
              {value: this.workTable[1].quantity, name: '未完成'},
              {value: this.workTable[2].quantity, name: '异常'}
            ]
            setTimeout(() => {
              this.workOption.title.text = workTitle
              this.workOption.series[0].data = chartData
            }, 100)
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
    // 合并列
    mergeLineMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (rowIndex % 3 === 0) {
          return {
            rowspan: 3,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
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

<style lang="less">
  .large-dialog{
    .form-title{
      height: 45px;
      line-height: 45px;
      font-size: 16px;
      color: #272727;
    }
    .show-img{
      padding-bottom: 10px;
      border-bottom: 1px solid #cecece;
      margin-bottom: 20px;
      .images{
        text-align: center;
        img{
          margin: 5px;
        }
      }
      .img-hint{
        height: 35px;
        line-height: 35px;
        text-align: center;
      }
    }
    .show-table{
      margin-top: 10px;
      border-radius: 4px;
      border: 1px solid #cecece;
    }
    .report-item{
      margin-bottom: 20px;
      font-size: 0;
      .el-table{
        display: inline-block;
        width: 50%;
      }
      .report-chart{
        display: inline-block;
        height: 180px;
        width: 50%;
      }
      .dice{
        display: inline-block;
        width: 12px;
        height: 12px;
        &.finish{
          background: #b7dd73;
        }
        &.undone{
          background: #ffdb8a;
        }
        &.abnormal{
          background: #fa6b67;
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
</style>
