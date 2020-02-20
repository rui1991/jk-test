<template>
  <div>
    <!-- 新增 -->
    <el-dialog title="新增设备" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <p style="height: 35px; color: #f04645;">提示：如需添加采集信息，请通过用户管理进行添加！</p>
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select style="width: 100%;" v-model="formData.type" placeholder="请选择设备类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备mac" prop="mac" v-if="!serialShow">
          <el-input v-model.trim="formData.mac" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="序列号" prop="serial" v-if="serialShow">
          <el-input v-model.trim="formData.serial" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备位置" prop="posName" v-show="postionShow">
          <el-input :disabled="true" v-model="formData.posName"></el-input>
          <el-button type="primary" @click="posDialog = true">选择位置</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 位置 -->
    <pos-module :parentDialog="posDialog" @parentSelect="posSelect" @parentCancel="posCancel"></pos-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入位置组件
import posModule from '@/components/facility/hardfac-pos'
export default{
  props: ['parentDialog'],
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
        callback(new Error('请输入设备的mac地址'))
      }
    }
    let checkSerial = (rule, value, callback) => {
      let regex = /^[0-9a-zA-Z]+$/
      const formValue = value.replace(/:/g, '')
      if (formValue) {
        if (formValue.match(regex)) {
          callback()
        } else {
          callback(new Error('你输入的序列号格式有误，请认真核对'))
        }
      } else {
        callback(new Error('请输入设备的序列号'))
      }
    }
    return {
      typeOptions: [
        {
          label: '数据网关',
          value: 'sjwg'
        },
        {
          label: '考勤机',
          value: 'kqj'
        }
      ],
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ],
        mac: [
          { required: true, validator: checkMac, trigger: 'blur' }
        ],
        serial: [
          { required: true, validator: checkSerial, trigger: 'blur' }
        ]
      },
      formData: {
        name: '',
        type: 'sjwg',
        mac: '',
        serial: '',
        posName: '',
        posId: ''
      },
      serialShow: false,
      postionShow: true,
      posDialog: false,
      disabled: false
    }
  },
  created () {

  },
  components: {
    posModule
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
    // 初始化数据
    addInit () {
      this.formData = {
        name: '',
        type: 'sjwg',
        mac: '',
        serial: '',
        posName: '',
        posId: ''
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
      const type = this.formData.type
      let coding
      if (type === 'kqj') {
        coding = this.formData.serial
        coding = this.formatSetSerial(coding)
      } else {
        coding = this.formData.mac
        coding = this.formatSetMac(coding)
      }
      let params = {}
      if (this.formData.posId) {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          dname: this.formData.name,
          dtype: this.formData.type,
          mac: coding,
          location_id: this.formData.posId
        }
      } else {
        params = {
          company_id: this.companyId,
          user_id: this.userId,
          project_id: this.projectId,
          dname: this.formData.name,
          dtype: type,
          mac: coding
        }
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/addHardware',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          // 重置表单
          this.resetForm('ruleForm')
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
    },
    /* 位置选择 */
    posSelect (data) {
      this.formData.posName = data.name
      this.formData.posId = data.id
      this.posDialog = false
    },
    posCancel () {
      this.posDialog = false
    },
    // 格式化serial地址
    formatSetSerial (str) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      return value.replace(/:/g, '')
    },
    // 格式化Mac地址
    formatSetMac (str) {
      let value = str.toLowerCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.addInit()
      }
    },
    'formData.type' (nowVal, oldVal) {
      if (nowVal === 'sjwg') {
        this.serialShow = false
        this.postionShow = true
      } else {
        this.serialShow = true
        this.postionShow = false
        this.formData.posName = ''
        this.formData.posId = ''
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
