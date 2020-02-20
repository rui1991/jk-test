<template>
  <div class="task-basics">
    <el-form :model="parentBasics" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="任务名称" prop="name">
        <el-input style="width: 320px;" v-model.trim="parentBasics.name" auto-complete="off"></el-input>
      </el-form-item>
      <!--<el-form-item label="执行部门" prop="sector">-->
        <!--<el-select style="width: 320px;" v-model="parentBasics.sector" filterable placeholder="请选择执行部门">-->
          <!--<el-option-->
            <!--v-for="item in sectorOptions"-->
            <!--:key="item.base_id"-->
            <!--:label="item.name"-->
            <!--:value="item.base_id">-->
          <!--</el-option>-->
        <!--</el-select>-->
      <!--</el-form-item>-->
      <el-form-item label="选择时间" prop="date">
        <el-date-picker
          style="width: 320px;"
          v-model="parentBasics.date"
          :clearable="false"
          value-format="yyyy-MM-dd HH:mm:ss"
          format="yyyy-MM-dd HH:mm"
          :time-arrow-control="true"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间">
        </el-date-picker>
      </el-form-item>
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
    let checkData = (rule, value, callback) => {
      if (value) {
        const nowDate = new Date().getTime()
        const valueData = new Date(value[0]).getTime()
        if (nowDate > valueData) {
          callback(new Error('开始日期不能小于当前时间'))
        } else {
          callback()
        }
      } else {
        callback(new Error('请选择时间'))
      }
    }
    return {
      formLabelWidth: '100px',
      whetherChange: false,
      sectorOptions: [],
      showTimes: false,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      rules: {
        name: [
          { required: true, message: '请输入计划名称', trigger: 'blur' }
        ],
        // sector: [
        //   { required: true, message: '请选择执行部门', trigger: 'change' }
        // ],
        date: [
          { required: true, validator: checkData, trigger: 'change' }
        ]
      }
    }
  },
  created () {
    // 获取部门
    // this.getSectorOptions()
  },
  computed: {
    ...mapState('other', [
      'projectOrgId'
    ])
  },
  methods: {
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
    }
  }
}
</script>

<style lang="less" scoped>
.task-basics{
  width: 420px;
  margin: 0 auto;
  .operate{
    padding-top: 30px;
    text-align: center;
  }
}
</style>
