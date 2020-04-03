<template>
  <div class="orange-module">
    <h3 class="module-title">编辑企业</h3>
    <el-form :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="企业名称" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="linkman">
        <el-select style="width: 100%;" v-model="formData.linkman" filterable placeholder="请选择联系人">
          <el-option
            v-for="item in crewOptions"
            :key="item.user_id"
            :label="item.user_name"
            :value="item.user_phone">
            <span style="float: left">{{ item.user_name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.user_phone }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="坐标" prop="coord">
        <el-input :disabled="true" v-model="formData.coord" style="width: 360px; margin-right: 20px;"></el-input>
        <el-button type="primary" @click="mapDialog = true">选择坐标</el-button>
      </el-form-item>
    </el-form>
    <div class="module-operate">
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
    <!-- 地图坐标 -->
    <map-module
      :parentDialog="mapDialog"
      :parentCoord="formData.coord"
      @parentUpdata="mapUpdata"
      @parentCancel="mapCancel">
    </map-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入地图组件
import mapModule from '@/components/company/organ-map'
export default{
  props: ['parentOrgId', 'parentOrgType', 'parentBaseId'],
  data () {
    return {
      formLabelWidth: '100px',
      rules: {
        name: [
          {required: true, message: '请输入企业名称', trigger: 'blur'}
        ],
        linkman: [
          { required: true, message: '请选择联系人', trigger: 'change' }
        ]
      },
      formData: {
        parentId: 1,
        name: '',
        linkman: '',
        nature: '',
        area: '',
        trade: '',
        scale: '',
        coord: '',
        state: 0
      },
      crewOptions: [],
      disabled: false,
      mapDialog: false
    }
  },
  created () {

  },
  mounted () {
    // 获取详情
    this.getDetails()
    // 获取人员
    this.getCrewOptions()
  },
  components: {
    mapModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 获取人员
    getCrewOptions () {
      let params = {
        organize_id: this.parentOrgId,
        user_name: '',
        user_phone: '',
        role_id: '',
        page: 1,
        limit1: 100000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewOptions = res.data.data1.users
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
    // 获取详情
    getDetails () {
      let params = {
        organize_id: this.parentOrgId,
        organize_type: this.parentOrgType,
        base_id: this.parentBaseId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.2/selOrganizeTreeType',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          this.formData = {
            parentId: 1,
            name: itemData.ogz_name,
            linkman: itemData.ogz_phone,
            nature: itemData.nature,
            area: itemData.area,
            trade: itemData.industry,
            scale: itemData.size,
            coord: itemData.coordinate || '',
            state: 0
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
      const phone = this.formData.linkman
      const crewItem = this.crewOptions.find(item => {
        return item.user_phone === phone
      })
      const uname = crewItem.user_name
      let params = {
        user_id: this.userId,
        base_id: this.parentBaseId,
        organize_id: this.parentOrgId,
        organize_type: this.parentOrgType,
        ogz_name: this.formData.name,
        parent_up_id: this.formData.parentId,
        user_name: uname,
        ogz_phone: phone,
        nature: this.formData.nature,
        area: this.formData.area,
        industry: this.formData.trade,
        size: this.formData.scale,
        coordinate: this.formData.coord,
        ogz_state: this.formData.state,
        address: '',
        remarks: ''
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.2/altOrganizeTree',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '企业编辑成功！',
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
    /* 地图坐标 */
    mapUpdata (data) {
      this.formData.coord = data
      this.mapDialog = false
    },
    mapCancel () {
      this.mapDialog = false
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
