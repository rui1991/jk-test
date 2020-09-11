<template>
  <div class="orange-module">
    <h3 class="module-title">{{ titleName }}</h3>
    <el-form :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item :label="name" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="上级机构">
        <el-input :disabled="true" v-model="parentOrgName"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="linkman">
        <el-input v-model.trim="formData.linkman" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model.trim="formData.phone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="分公司地址" prop="area" v-show="filiale">
        <el-input v-model.trim="formData.area" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-radio-group v-model="formData.state">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">冻结</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="module-operate">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentOrgId', 'parentOrgName', 'parentAddType'],
  data () {
    return {
      titleName: '新增机构',
      name: '机构名称',
      mesHint: '机构新增成功！',
      formLabelWidth: '100px',
      rules: {
        name: [
          {required: true, message: '请输入企业名称', trigger: 'blur'}
        ],
        linkman: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ]
      },
      formData: {
        name: '',
        linkman: '',
        phone: '',
        area: '',
        coord: '',
        remark: '',
        state: 0
      },
      filiale: false,
      disabled: false
    }
  },
  created () {

  },
  mounted () {
    // 判断组织类型
    const addType = this.parentAddType
    if (addType === 2) {
      this.titleName = '新增分公司'
      this.name = '分公司名称'
      this.mesHint = '分公司新增成功！'
      this.filiale = true
    } else if (addType === 3) {
      this.titleName = '新增项目'
      this.name = '项目名称'
      this.mesHint = '项目新增成功！'
      this.filiale = false
    } else if (addType === 4) {
      this.titleName = '新增部门'
      this.name = '部门名称'
      this.mesHint = '部门新增成功！'
      this.filiale = false
    }
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
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
    // 提交
    sendRequest () {
      let params = {
        user_id: this.userId,
        parent_id: this.parentOrgId,
        organize_type: this.parentAddType,
        organize_name: this.formData.name,
        user_name: this.formData.linkman,
        user_phone: this.formData.phone,
        address: this.formData.area,
        coordinate: this.formData.coord,
        remarks: this.formData.remark,
        com_state: this.formData.state
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.2/addOrganizeTree',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: this.mesHint,
            type: 'success'
          })
          // 刷新树
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
      this.$emit('parentCancel')
    }
  }
}
</script>

<style lang="less" scoped>
  .orange-module{
    width: 600px;
    margin: 0 auto;
    .module-title{
      height: 60px;
      text-align: center;
      line-height: 60px;
      font-size: 16px;
      font-weight: 600;
    }
    .module-operate {
      margin-top: 50px;
      text-align: center;
    }
  }
</style>
