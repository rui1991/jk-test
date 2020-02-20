<template>
  <div class="plan-basics">
    <el-form :model="parentBasics" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="计划名称" prop="name">
        <el-input style="width: 350px;" v-model.trim="parentBasics.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="执行类型" prop="exetype" v-if="parentBasics.showExetype">
        <el-radio-group v-model="parentBasics.exetype">
          <el-radio :label="1">执行人员</el-radio>
          <el-radio :label="2">执行组</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="执行部门" prop="sector" v-show="parentBasics.exetype === 1">
        <el-select v-model="parentBasics.sector" @change="sectorChange" filterable placeholder="请选择执行部门">
          <el-option
            v-for="item in sectorOptions"
            :key="item.base_id"
            :label="item.name"
            :value="item.base_id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="执行组" prop="group" v-show="parentBasics.exetype === 2">
        <el-select v-model="parentBasics.group" filterable placeholder="请选择执行组">
          <el-option
            v-for="item in groupOptions"
            :key="item.group_id"
            :label="item.group_name"
            :value="item.group_id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择日期" prop="date">
        <el-date-picker
          style="width: 250px;"
          v-model="parentBasics.date"
          type="daterange"
          value-format="yyyy-MM-dd"
          :clearable="false"
          :picker-options="pickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="任务模式" prop="pattern">
        <el-radio-group v-model="parentBasics.pattern" @change="whetherShowTimes">
          <el-radio :label="1">单次任务</el-radio>
          <el-radio :label="0">循环任务</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="任务" v-if="parentBasics.exetype === 1 && parentBasics.pattern === 1">
        <el-select v-model="parentBasics.crewId" filterable clearable placeholder="请选择人员">
          <el-option
            v-for="item in crewOptions"
            :key="item.user_id"
            :label="item.user_name"
            :value="item.user_id">
          </el-option>
        </el-select>
      </el-form-item>
      <div v-if="parentBasics.pattern === 0">
        <el-form-item label="执行频次" prop="frequency">
          <el-select style="width: 80px;" v-model="parentBasics.frequency" filterable placeholder="频率" @change="whetherShowTimes">
            <el-option
              v-for="item in frequencyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select style="width: 80px;" v-model="parentBasics.unit" filterable placeholder="单位" @change="whetherShowTimes">
            <el-option
              v-for="item in unitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select style="width: 80px; margin-right: 5px;" v-model="parentBasics.degree" filterable placeholder="次数" @change="frequencyChange">
            <el-option
              v-for="item in degreeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>次
        </el-form-item>
        <div v-if="parentBasics.exetype === 1 && !showTimes">
          <el-form-item label="任务" v-for="(crew, index) in parentBasics.crews" :key="index">
            <el-select v-model="crew.user_id" filterable clearable placeholder="请选择人员">
              <el-option
                v-for="item in crewOptions"
                :key="item.user_id"
                :label="item.user_name"
                :value="item.user_id">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="周期" prop="period" v-if="showTimes">
          <el-checkbox-group v-model="parentBasics.period">
            <el-checkbox :label="0" name="period">星期日</el-checkbox>
            <el-checkbox :label="1" name="period">星期一</el-checkbox>
            <el-checkbox :label="2" name="period">星期二</el-checkbox>
            <el-checkbox :label="3" name="period">星期三</el-checkbox>
            <el-checkbox :label="4" name="period">星期四</el-checkbox>
            <el-checkbox :label="5" name="period">星期五</el-checkbox>
            <el-checkbox :label="6" name="period">星期六</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <div v-if="showTimes">
          <div style="font-size: 0;" v-for="(item, index) in parentBasics.times" :key="index">
            <el-form-item label="开始时间" prop="times" style="display: inline-block;">
              <el-time-picker
                style="width: 150px;"
                arrow-control
                :clearable="false"
                value-format="HH:mm"
                format="HH:mm"
                v-model="item.startTime"
                placeholder="开始时间">
              </el-time-picker>
            </el-form-item>
            <el-form-item label="结束时间" prop="times" style="display: inline-block;">
              <el-time-picker
                style="width: 150px;"
                arrow-control
                :clearable="false"
                value-format="HH:mm"
                format="HH:mm"
                v-model="item.endTime"
                placeholder="结束时间">
              </el-time-picker>
            </el-form-item>
            <el-form-item label="选择人员" style="display: inline-block;" v-if="parentBasics.exetype === 1">
              <el-select style="width: 150px;" v-model="item.user_id" filterable clearable placeholder="请选择人员">
                <el-option
                  v-for="item in crewOptions"
                  :key="item.user_id"
                  :label="item.user_name"
                  :value="item.user_id">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
    <div class="operate">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="submitForm('ruleForm')">下一步</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentBasics'],
  data () {
    let checkSector = (rule, value, callback) => {
      if (this.parentBasics.exetype === 1) {
        if (value) {
          callback()
        } else {
          callback(new Error('请选择执行部门'))
        }
      } else {
        callback()
      }
    }
    let checkGroup = (rule, value, callback) => {
      if (this.parentBasics.exetype === 2) {
        if (value) {
          callback()
        } else {
          callback(new Error('请选择执行组'))
        }
      } else {
        callback()
      }
    }
    let checkData = (rule, value, callback) => {
      if (value.length > 0) {
        if (!this.parentBasics.showExetype) {
          const nowDate = new Date().getTime()
          const valueData = new Date(value[0] + ' 00:00:00').getTime()
          if (nowDate > valueData) {
            callback(new Error('开始日期必须大于当前日期'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      } else {
        callback(new Error('请选择日期'))
      }
    }
    return {
      formLabelWidth: '100px',
      sectorOptions: [],
      groupOptions: [],
      crewOptions: [],
      showTimes: false,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      frequencyOptions: [
        {
          label: '1',
          value: 1
        },
        {
          label: '2',
          value: 2
        },
        {
          label: '3',
          value: 3
        },
        {
          label: '4',
          value: 4
        },
        {
          label: '5',
          value: 5
        },
        {
          label: '6',
          value: 6
        },
        {
          label: '7',
          value: 7
        },
        {
          label: '8',
          value: 8
        },
        {
          label: '9',
          value: 9
        },
        {
          label: '10',
          value: 10
        },
        {
          label: '11',
          value: 11
        },
        {
          label: '12',
          value: 12
        },
        {
          label: '13',
          value: 13
        },
        {
          label: '14',
          value: 14
        },
        {
          label: '15',
          value: 15
        },
        {
          label: '16',
          value: 16
        },
        {
          label: '17',
          value: 17
        },
        {
          label: '18',
          value: 18
        },
        {
          label: '19',
          value: 19
        },
        {
          label: '20',
          value: 20
        },
        {
          label: '21',
          value: 21
        },
        {
          label: '22',
          value: 22
        },
        {
          label: '23',
          value: 23
        },
        {
          label: '24',
          value: 24
        },
        {
          label: '25',
          value: 25
        },
        {
          label: '26',
          value: 26
        },
        {
          label: '27',
          value: 27
        },
        {
          label: '28',
          value: 28
        },
        {
          label: '29',
          value: 29
        },
        {
          label: '30',
          value: 30
        }
      ],
      unitOptions: [
        {
          label: '天',
          value: '天'
        },
        {
          label: '周',
          value: '周'
        },
        {
          label: '月',
          value: '月'
        },
        {
          label: '年',
          value: '年'
        }
      ],
      degreeOptions: [
        {
          label: '1',
          value: 1
        },
        {
          label: '2',
          value: 2
        },
        {
          label: '3',
          value: 3
        },
        {
          label: '4',
          value: 4
        },
        {
          label: '5',
          value: 5
        },
        {
          label: '6',
          value: 6
        },
        {
          label: '7',
          value: 7
        },
        {
          label: '8',
          value: 8
        },
        {
          label: '9',
          value: 9
        },
        {
          label: '10',
          value: 10
        }
      ],
      rules: {
        name: [
          { required: true, message: '请输入计划名称', trigger: 'blur' }
        ],
        exetype: [
          { required: true, message: '请选择执行类型', trigger: 'change' }
        ],
        sector: [
          { required: true, validator: checkSector, trigger: 'change' }
        ],
        group: [
          { required: true, validator: checkGroup, trigger: 'change' }
        ],
        date: [
          { required: true, validator: checkData, trigger: 'change' }
        ],
        pattern: [
          { required: true, message: '请选择任务模式', trigger: 'change' }
        ],
        period: [
          { type: 'array', required: true, message: '请至少选择一个周期', trigger: 'change' }
        ],
        times: [
          { required: true, message: '请选择时间', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    // 获取部门
    this.getSectorOptions()
    // 判断是否获取人员
    if (this.parentBasics.sector) {
      this.getSectorCrew()
    }
    // 获取组
    this.getGroupOptions()
    // 判断是否显示时段
    this.whetherShowTimes()
  },
  mounted () {

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
    // 选择频次
    frequencyChange () {
      const degree = parseInt(this.parentBasics.degree)
      // 人员
      let crews = []
      for (let i = 0; i < degree; i++) {
        const crewItem = {
          user_id: ''
        }
        crews.push(crewItem)
      }
      this.parentBasics.crews = crews
      // 时段
      let times = []
      for (let i = 0; i < degree; i++) {
        let time = {
          startTime: '00:00',
          endTime: '00:00',
          user_id: ''
        }
        times.push(time)
      }
      this.parentBasics.times = times
    },
    // 验证表单
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendParent()
        } else {
          return false
        }
      })
    },
    sendParent () {
      this.$emit('parentBasicsFun', this.parentBasics)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancelFun')
    },
    /* 选择部门 */
    getSectorOptions () {
      let params = {
        organize_id: this.projectOrgId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.sectorOptions = res.data.data1[0].children
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
    // 部门人员
    sectorChange (value) {
      let params = {
        project_id: this.projectId,
        ogz_id: value
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/selUserByOgz',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewOptions = res.data.data1
          // 清空选中人员
          this.parentBasics.crewId = ''
          this.parentBasics.crews.forEach(item => {
            item.user_id = ''
          })
          this.parentBasics.times.forEach(item => {
            item.user_id = ''
          })
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
    // 编辑时初始化部门人员
    getSectorCrew () {
      let params = {
        project_id: this.projectId,
        ogz_id: this.parentBasics.sector
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.7/selUserByOgz',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewOptions = res.data.data1
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
    /* 选择组 */
    getGroupOptions () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        user_name: '',
        group_id: '',
        start_date: '',
        end_date: '',
        group_name: '',
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.6/selDutyGroupAndUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.groupOptions = res.data.data1.dataList
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
    /* 是否显示时间段 */
    whetherShowTimes () {
      // 任务模式
      const pattern = this.parentBasics.pattern
      if (pattern === 0) {
        // 频率
        const frequency = this.parentBasics.frequency
        // 单位
        const unit = this.parentBasics.unit
        if (frequency === 1 && unit === '天') {
          this.showTimes = true
        } else {
          this.showTimes = false
        }
      } else {
        this.showTimes = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.plan-basics{
  width: 760px;
  margin: 0 auto;
  .operate{
    padding-top: 30px;
    text-align: center;
    .el-button{
      margin: 0 20px;
    }
  }
}
</style>
