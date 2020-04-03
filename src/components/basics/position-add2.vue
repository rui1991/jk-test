<template>
  <div class="position-module">
    <h3 class="title">批量新增位置</h3>
    <el-form :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="上级位置" prop="parent">
        <el-input :disabled="true" v-model="formData.parent"></el-input>
      </el-form-item>
      <el-form-item label="位置类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择位置类型">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="输入类型" prop="importType">
        <el-radio-group v-model="formData.importType">
          <el-radio :label="1">连续</el-radio>
          <el-radio :label="2">无规则</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="位置名称" required v-if="formData.importType === 1">
        <el-col :span="10">
          <el-form-item prop="name1">
            <el-input v-model.number="formData.name1" type="number" auto-complete="off"></el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="4" style="text-align: center;">----</el-col>
        <el-col :span="10">
          <el-form-item prop="name2">
            <el-input v-model.number="formData.name2" type="number" auto-complete="off"></el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="位置名称" prop="name" v-else>
        <el-input v-model.trim="formData.names" placeholder="多个位置名称之间用英文逗号隔开" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="单位名称" required v-if="formData.importType === 1">
        <el-col :span="12">
          <el-form-item prop="unit">
            <el-input v-model.trim="formData.unit" auto-complete="off"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="padding-left: 20px; color: red;">例如：栋，单元，层，等！</el-col>
      </el-form-item>
      <el-form-item label="位置状态" prop="state">
        <el-switch v-model="formData.state" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
      </el-form-item>
    </el-form>
    <div class="operate">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentId', 'parentName', 'parentType'],
  data () {
    return {
      formLabelWidth: '100px',
      typeOptions: [
        {
          label: '楼栋',
          value: 1
        },
        {
          label: '单元',
          value: 2
        },
        {
          label: '楼层',
          value: 3
        },
        // {
        //   label: '位置',
        //   value: 5
        // },
        {
          label: '公共区域',
          value: 6
        },
        {
          label: '停车场',
          value: 7
        },
        {
          label: '商铺',
          value: 8
        }
      ],
      rules: {
        type: [
          { required: true, message: '请选择位置类型', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入位置名称', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '请选择位置状态', trigger: 'change' }
        ],
        importType: [
          { required: true, message: '请选择输入类型', trigger: 'change' }
        ],
        name1: [
          { required: true, message: '请输入位置名称', trigger: 'blur' }
        ],
        name2: [
          { required: true, message: '请输入位置名称', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请输入单位名称', trigger: 'blur' }
        ]
      },
      formData: {
        parent: '',
        type: '',
        importType: 1,
        names: '',
        name1: '',
        name2: '',
        unit: '',
        state: true
      },
      disabled: false
    }
  },
  mounted () {
    // 设置上传地址
    this.reqUrl = '/ezx_jk/upload?state=10&user_id' + this.userId
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    addInit () {
      // 重置表单
      this.resetForm('ruleForm')
      this.formData.parent = this.parentName
    },
    // 验证表单
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sendRequest()
        } else {
          return false
        }
      })
    },
    // 重置表单
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    // 提交
    sendRequest () {
      // 状态
      const state = this.formData.state
      let stateCode = 1
      if (state) {
        stateCode = 0
      }
      // 输入类型
      const importType = this.formData.importType
      let params = {}
      if (importType === 1) {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          parent_id: this.parentId,
          location_type: this.formData.type,
          input_type: importType,
          start_location_name: this.formData.name1,
          end_location_name: this.formData.name2,
          location_name_unit: this.formData.unit,
          remark: '',
          location_state: stateCode
        }
      } else {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          parent_id: this.parentId,
          location_type: this.formData.type,
          input_type: importType,
          location_names: this.formData.names,
          // start_location_name: this.formData.name1,
          // end_location_name: this.formData.name2,
          // location_name_unit: this.formData.unit,
          remark: '',
          location_state: stateCode
        }
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/location/v1.0/addBatchLocation',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '位置批量新增成功！',
            type: 'success'
          })
          // 刷新列表
          this.$emit('parentUpdata')
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
    },
    // 取消
    cancelClick () {
      // 重置表单
      this.resetForm('ruleForm')
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentType (val, oldVal) {
      if (val === 3) {
        this.addInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .position-module{
    width: 600px;
    margin: 0 auto;
    .title{
      height: 60px;
      text-align: center;
      line-height: 60px;
      font-size: 16px;
      font-weight: 600;
    }
    .operate{
      margin-top: 50px;
      text-align: center;
    }
    .show-img{
      padding-bottom: 10px;
      .img-title{
        width: 100px;
        padding-right: 12px;
        text-align: right;
      }
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
  }
</style>
