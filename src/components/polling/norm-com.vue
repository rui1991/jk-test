<template>
  <div>
    <el-dialog title="编辑标准" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="entirety-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="模板类型" prop="type">
          <el-input v-model.trim="formData.type"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark"></el-input>
        </el-form-item>
        <el-form-item label="巡检标准" prop="temIds">
          <el-input v-model="formData.temIds" v-show="false" style="width: 60%;"></el-input>
          <el-button type="primary" @click="temDialog = true">选择巡检标准</el-button>
        </el-form-item>
      </el-form>
      <el-table class="select-table" :data="formData.temData" style="width: 100%" v-show="formData.temData.length > 0">
        <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
        <el-table-column prop="ins_method" label="检查方法" class-name="multi-row"></el-table-column>
        <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
        <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <tem-module
      :parentDialog="temDialog"
      :parentIds="formData.temIds"
      @parentUpdata="temUpdata"
      @parentCancel="temCancel">
    </tem-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入模板组件
import temModule from '@/components/polling/norm-tem'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请输入模板类型', trigger: 'blur' }
        ],
        temIds: [
          { required: true, message: '请选择巡检标准', trigger: 'input' }
        ]
      },
      formData: {
        name: '',
        type: '',
        remark: '',
        temIds: '',
        temData: []
      },
      disabled: false,
      temDialog: false
    }
  },
  components: {
    temModule
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
    comInit () {
      this.formData = {
        name: '',
        type: '',
        remark: '',
        temIds: '',
        temData: []
      }
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        template_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/selTemplateByID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 名称
          this.formData.name = itemData.template_name
          // 类型
          this.formData.type = itemData.template_type
          // 描述
          this.formData.remark = itemData.describe
          // 模板id
          const temData = itemData.Ins
          let temIds = []
          temData.forEach(item => {
            temIds.push(item.ins_id)
          })
          temIds = temIds.join(',')
          this.formData.temIds = temIds
          this.getTemContent(temIds)
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
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        template_id: this.parentId,
        template_name: this.formData.name,
        template_type: this.formData.type,
        describe: this.formData.remark,
        ins_ids: this.formData.temIds
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/altTemplate',
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
    // 取消
    cancelClick () {
      // 重置表单
      this.resetForm('ruleForm')
      this.$emit('parentCancel')
    },
    /* 模板 */
    temUpdata (ids) {
      this.formData.temIds = ids
      this.getTemContent(ids)
    },
    getTemContent (ids) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0,
        ins_ids: ids
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/selInsByIds',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let temData = res.data.data1
          this.formData.temData = temData
          this.temDialog = false
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
    temCancel () {
      this.temDialog = false
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.comInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
