<template>
  <div>
    <el-dialog title="新增点名规则" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
      <el-form class="divide-from" :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
        <el-form-item label="点名人员" prop="crewName">
          <el-input :disabled="true" type="textarea" v-model="formData.crewName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="crewDialog = true">选择人员</el-button>
        </el-form-item>
        <el-form-item label="点名地址" prop="siteName">
          <el-input :disabled="true" type="textarea" v-model="formData.siteName"></el-input>
          <el-button type="primary" style="vertical-align: top;" @click="siteDialog = true">选择地址</el-button>
        </el-form-item>
        <el-form-item label="点名次数" prop="count">
          <el-input style="width: 140px;" v-model.trim="formData.count" auto-complete="off">
            <template slot="append">次</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelClick">取 消</el-button>
        <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 人员 -->
    <crew-module
      :parentDialog="crewDialog"
      :parentIds="formData.crewId"
      @parentUpdata="crewUpdata"
      @parentCancel="crewCancel">
    </crew-module>
    <!-- 地址 -->
    <site-module
      :parentDialog="siteDialog"
      :parentIds="formData.siteId"
      @parentUpdata="siteUpdata"
      @parentCancel="siteCancel">
    </site-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入人员组件
import crewModule from '@/components/public/crew-checkbox'
// 引入地址组件
import siteModule from '@/components/callname/callname-site'
export default{
  props: ['parentDialog'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        crewName: [
          { required: true, message: '请选择人员', trigger: 'change' }
        ],
        count: [
          { required: true, message: '请输入点名次数', trigger: 'blur' }
        ]
      },
      formData: {
        crewName: '',
        crewId: [],
        siteName: '',
        siteId: [],
        count: ''
      },
      disabled: false,
      crewDialog: false,
      siteDialog: false
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
  components: {
    crewModule,
    siteModule
  },
  methods: {
    addInit () {
      this.formData = {
        crewName: '',
        crewId: [],
        siteName: '',
        siteId: [],
        count: ''
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
      let count = this.formData.count + ''
      count = this.verifyNum(count)
      if (count > 24) {
        this.$message({
          showClose: true,
          message: '点名次数不能超过24次！',
          type: 'warning'
        })
        return
      }
      let crewId = this.formData.crewId
      crewId = crewId.join(',')
      let siteId = this.formData.siteId
      siteId = siteId.join(',')
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        users: crewId,
        positions: siteId,
        urc_size: count
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v2.0/setRollCallMessage',
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
    // 处理次数
    verifyNum (value) {
      let str = /^\+?[1-9][0-9]*$/
      return value.match(str) ? Number.parseInt(value) : 1
    },
    // 取消
    cancelClick () {
      // 重置表单
      this.resetForm('ruleForm')
      this.$emit('parentCancel')
    },
    /* 人员 */
    crewUpdata (data) {
      this.formData.crewName = data.names
      this.formData.crewId = data.ids
      this.crewDialog = false
    },
    crewCancel () {
      this.crewDialog = false
    },
    /* 地址 */
    siteUpdata (data) {
      this.formData.siteName = data.names
      this.formData.siteId = data.ids
      this.siteDialog = false
    },
    siteCancel () {
      this.siteDialog = false
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
