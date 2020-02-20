<template>
  <el-dialog title="新增地址" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="上级位置" prop="parentPath">
        <el-input :disabled="true" v-model="formData.parentPath"></el-input>
      </el-form-item>
      <el-form-item label="地址名称" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="区域类型" prop="areaType">
        <el-select style="width: 100%;" v-model="formData.areaType" placeholder="请选择区域类型">
          <el-option
            v-for="item in areaOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="地址类型" prop="type">
        <el-select style="width: 100%;" v-model="formData.type" placeholder="请选择地址类型">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="地址标签" prop="mac">
        <el-input v-model.trim="formData.mac" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="关联标准" prop="norm">
        <el-select style="width: 100%;" v-model="formData.norm"  clearable filterable placeholder="请选择标准">
          <el-option
            v-for="item in normOptions"
            :key="item.template_id"
            :label="item.template_name"
            :value="item.template_id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentName'],
  data () {
    let checkMac = (rule, value, callback) => {
      let regex = /^[a-zA-Z0-9]{8,12}$/
      const formValue = value.replace(/:/g, '')
      if (formValue) {
        if (formValue.match(regex)) {
          callback()
        } else {
          callback(new Error('你输入的mac格式有误，请认真核对'))
        }
      } else {
        callback()
      }
    }
    return {
      formLabelWidth: '100px',
      areaOptions: [
        {
          label: '楼栋',
          value: 0
        },
        {
          label: '单元',
          value: 1
        },
        {
          label: '楼层',
          value: 2
        },
        {
          label: '办公区域',
          value: 3
        },
        {
          label: '商铺',
          value: 4
        },
        {
          label: '卫生间',
          value: 5
        },
        {
          label: '停车场',
          value: 6
        },
        {
          label: '公共区域',
          value: 7
        },
        {
          label: '外围',
          value: 8
        },
        {
          label: '岗亭',
          value: 9
        }
      ],
      typeOptions: [
        {
          label: '巡检地址',
          value: 0
        },
        {
          label: '固定岗位',
          value: 6
        }
      ],
      normOptions: [],
      normState: false,
      rules: {
        name: [
          { required: true, message: '请输入地址名称', trigger: 'blur' }
        ],
        areaType: [
          { required: true, message: '请选择区域类型', trigger: 'change' }
        ],
        mac: [
          { validator: checkMac, trigger: 'blur' }
        ]
      },
      formData: {
        parentPath: '',
        name: '',
        areaType: 0,
        type: 0,
        mac: '',
        norm: '',
        remark: ''
      },
      disabled: false
    }
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
      this.formData = {
        parentPath: this.parentName,
        name: '',
        areaType: 0,
        type: 0,
        mac: '',
        norm: '',
        remark: ''
      }
      if (!this.normState) {
        this.getNormOptions()
      }
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
      let mac = this.formData.mac
      mac = this.formatSetMac(mac)
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        parent_po_id: this.parentId.replace(/w/g, ''),
        parent_address: this.formData.parentPath,
        position_name: this.formData.name,
        area_type: this.formData.areaType,
        position_type: this.formData.type,
        position_mac: mac,
        template_id: this.formData.norm || 0,
        instructions: this.formData.remark,
        depth: 1
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/addPosition',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetForm('ruleForm')
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
    // 格式化设置Mac地址
    formatSetMac (str) {
      if (!str) { return '' }
      const mac = str.replace(/:/g, '')
      let value = mac.toLowerCase()
      return value
    },
    // 取消
    cancelClick () {
      // 重置表单
      this.resetForm('ruleForm')
      this.$emit('parentCancel')
    },
    // 获取标准
    getNormOptions () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        projectN_id: this.projectId,
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selTemplateBySearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let normData = res.data.data1.templates || []
          this.normOptions = normData
          this.normState = true
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
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.addInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
