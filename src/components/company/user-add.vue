<template>
 <div>
   <el-dialog title="新增用户" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
     <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
       <el-form-item label="用户姓名" prop="name">
         <el-input v-model.trim="formData.name"></el-input>
       </el-form-item>
       <el-form-item label="工号" prop="worknum">
         <el-input v-model.trim="formData.worknum"></el-input>
       </el-form-item>
       <el-form-item label="手机号码" prop="phone">
         <el-input v-model.trim="formData.phone" auto-complete="off"></el-input>
       </el-form-item>
       <el-form-item label="所属部门" prop="sectorName">
         <el-input :disabled="true" v-model="formData.sectorName"></el-input>
         <el-button type="primary" @click="sectorDialog = true">选择部门</el-button>
       </el-form-item>
       <el-form-item label="角色" prop="role">
         <el-select v-model="formData.role" filterable placeholder="请选择用户角色">
           <el-option
             v-for="item in parentRoles"
             :key="item.role_id"
             :label="item.role_name"
             :value="item.role_id">
           </el-option>
         </el-select>
       </el-form-item>
       <el-form-item label="授权范围" prop="accreditName">
         <el-input type="textarea" :disabled="true" v-model="formData.accreditName"></el-input>
         <el-button type="primary" @click="accreditDialog = true">选择范围</el-button>
       </el-form-item>
       <el-form-item label="技能" prop="skills">
         <el-select v-model="formData.skills" multiple collapse-tags placeholder="请选择技能">
           <el-option
             v-for="item in skillOptions"
             :key="item.id"
             :label="item.name"
             :value="item.id">
           </el-option>
         </el-select>
       </el-form-item>
     </el-form>
     <div slot="footer" class="dialog-footer">
       <el-button @click="cancelClick">取 消</el-button>
       <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
     </div>
   </el-dialog>
   <!-- 部门 -->
   <sector-module :parentDialog="sectorDialog" @parentUpdata="sectorUpdata" @parentCancel="sectorCancel"></sector-module>
   <!-- 授权范围 -->
   <accredit-module :parentDialog="accreditDialog" :parentId="formData.accreditId" @parentUpdata="accreditUpdata" @parentCancel="accreditCancel"></accredit-module>
 </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入部门组件
import sectorModule from '@/components/company/user-sector'
// 引入部门组件
import accreditModule from '@/components/company/user-accredit'
export default{
  props: ['parentDialog', 'parentRoles'],
  data () {
    let checkWorknum = (rule, value, callback) => {
      let regex = /^[0-9a-zA-Z]+$/
      if (value) {
        if (value.match(regex)) {
          callback()
        } else {
          callback(new Error('你输入的工号格式有误，请认真核对'))
        }
      } else {
        callback()
      }
    }
    let checkPhone = (rule, value, callback) => {
      let regex = /^1[3|4|5|6|7|8|9][0-9]{9}$/
      if (value) {
        if (value.match(regex)) {
          callback()
        } else {
          callback(new Error('手机号码格式错误'))
        }
      } else {
        callback(new Error('请输入手机号码'))
      }
    }
    return {
      formLabelWidth: '100px',
      skillOptions: [],
      rules: {
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        worknum: [
          { required: false, validator: checkWorknum, trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: checkPhone, trigger: 'blur' }
        ],
        sectorName: [
          { required: true, message: '请选择所属部门', trigger: 'change' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        accreditName: [
          { required: true, message: '请选择授权范围', trigger: 'change' }
        ]
      },
      formData: {
        name: '',
        worknum: '',
        phone: '',
        sectorName: '',
        sectorId: '',
        role: '',
        accreditName: '',
        accreditId: [],
        skills: []
      },
      disabled: false,
      sectorDialog: false,
      accreditDialog: false
    }
  },
  created () {

  },
  components: {
    sectorModule,
    accreditModule
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId'
    ])
  },
  methods: {
    // 初始化数据
    addInit () {
      this.formData = {
        name: '',
        worknum: '',
        phone: '',
        sectorName: '',
        sectorId: '',
        role: '',
        accreditName: '',
        accreditId: [],
        skills: []
      }
      if (this.skillOptions.length === 0) {
        // 获取技能选项列表
        this.getSkillData()
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
      // 权限范围
      let accreditId = this.formData.accreditId
      accreditId = accreditId.join(',')
      // 技能
      let skills = this.formData.skills
      skills = skills.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        user_name: this.formData.name,
        pin: this.formData.worknum,
        user_phone: this.formData.phone,
        ogz_id: this.formData.sectorId,
        role_id: this.formData.role,
        organize_ids: accreditId,
        skills_id: skills
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/addUser',
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
    /* 部门 */
    sectorUpdata (data) {
      this.formData.sectorName = data.name
      this.formData.sectorId = data.id
      this.sectorDialog = false
    },
    sectorCancel () {
      this.sectorDialog = false
    },
    /* 授权范围 */
    accreditUpdata (data) {
      this.formData.accreditName = data.names
      this.formData.accreditId = data.ids
      this.accreditDialog = false
    },
    accreditCancel () {
      this.accreditDialog = false
    },
    /* 技能 */
    getSkillData (skills) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selSkillTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const skillData = res.data.data1
          let skillOptions = []
          skillData.forEach(item => {
            skillOptions.push({
              name: item.name,
              id: item.children[0].id
            })
          })
          this.skillOptions = skillOptions
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
