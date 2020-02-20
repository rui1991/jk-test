<template>
  <el-dialog title="用户详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :label-width="formLabelWidth">
      <el-form-item label="用户姓名">
        <el-input :disabled="true" v-model="formData.name"></el-input>
      </el-form-item>
      <el-form-item label="工号">
        <el-input :disabled="true" v-model.trim="formData.worknum"></el-input>
      </el-form-item>
      <el-form-item label="手机号码">
        <el-input :disabled="true" v-model="formData.phone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="所属部门">
        <el-input :disabled="true" v-model="formData.sector" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="角色">
        <el-input :disabled="true" v-model="formData.role" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="卡片mac">
        <el-input :disabled="true" v-model="formData.mac" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="授权范围">
        <el-input type="textarea" :disabled="true" v-model="formData.accredit" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="技能">
        <el-input type="textarea" :disabled="true" v-model="formData.skill" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        name: '',
        worknum: '',
        phone: '',
        sector: '',
        role: '',
        mac: '',
        accredit: '',
        skill: ''
      }
    }
  },
  created () {

  },
  methods: {
    detInit () {
      this.formData = {
        name: '',
        worknum: '',
        phone: '',
        sector: '',
        role: '',
        mac: '',
        accredit: '',
        skill: ''
      }
      this.getDetails()
    },
    // 查看详情
    getDetails () {
      let params = {
        userN_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selUserOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 授权范围
          const accredits = itemData.userOgzs
          let accreditName = []
          accredits.forEach(item => {
            accreditName.push(item.organize_name)
          })
          accreditName = accreditName.join('、')
          // 技能
          const skills = itemData.userSkls
          let skillName = []
          skills.forEach(item => {
            skillName.push(item.parent_name)
          })
          skillName = skillName.join('、')
          this.formData = {
            name: itemData.user_name,
            worknum: itemData.pin || '',
            phone: itemData.user_phone,
            sector: itemData.organize_name,
            role: itemData.role_name,
            mac: itemData.card_mac || '',
            accredit: accreditName,
            skill: skillName
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
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.detInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
