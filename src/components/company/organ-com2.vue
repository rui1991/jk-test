<template>
  <div class="orange-module">
    <h3 class="module-title">{{ titleName }}</h3>
    <el-form :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item :label="name" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="上级机构" prop="parent">
        <el-input :disabled="true" v-model="formData.parentName" style="width: 360px; margin-right: 20px;"></el-input>
        <el-button type="primary" :disabled="parentDisabled" @click="parDialog = true">选择上级</el-button>
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
      <el-form-item label="坐标" prop="coord">
        <el-input :disabled="true" v-model="formData.coord" style="width: 360px; margin-right: 20px;"></el-input>
        <el-button type="primary" @click="mapDialog = true">选择坐标</el-button>
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
    <div style="text-align: center; overflow-x: hidden;" v-show="imgUrl">
      <img :src="imgUrl" height="240" alt="">
    </div>
    <div class="module-operate">
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
      <el-upload
        style="display: inline-block;"
        v-show="imgBtn"
        class="upload-demo"
        :headers="reqHead"
        :action="reqUrl"
        :on-success="handleSuccess"
        :on-error="handleError"
        :show-file-list="false"
        :file-list="fileList"
        :multiple="false"
        :limit="imgLimit"
        list-type="picture">
        <el-button type="primary">{{ imgBtnTxt }}</el-button>
      </el-upload>
    </div>
    <!-- 地图坐标 -->
    <map-module
      :parentDialog="mapDialog"
      :parentCoord="formData.coord"
      @parentUpdata="mapUpdata"
      @parentCancel="mapCancel">
    </map-module>
    <!-- 上级机构 -->
    <parent-module
      :parentDialog="parDialog"
      @parentUpdata="parUpdata"
      @parentCancel="parCancel">
    </parent-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入地图组件
import mapModule from '@/components/company/organ-map'
// 引入上级机构选择组件
import parentModule from '@/components/company/organ-parent'
export default{
  props: ['parentOrgId', 'parentOrgType', 'parentBaseId'],
  data () {
    return {
      titleName: '编辑机构',
      name: '机构名称',
      mesHint: '机构编辑成功！',
      formLabelWidth: '100px',
      rules: {
        name: [
          {required: true, message: '请输入机构名称', trigger: 'blur'}
        ],
        linkman: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ]
      },
      formData: {
        parentId: 1,
        parentName: '',
        name: '',
        linkman: '',
        phone: '',
        area: '',
        coord: '',
        remark: '',
        state: 0
      },
      parDialog: false,
      parentDisabled: true,
      filiale: false,
      disabled: false,
      mapDialog: false,
      imgUrl: '',
      reqHead: {
        token: '',
        user_id: 0
      },
      reqUrl: '',
      imgLimit: 1,
      imgBtn: false,
      imgBtnTxt: '上传图片',
      fileList: []
    }
  },
  created () {

  },
  mounted () {
    // 获取详情
    this.getDetails()
    const orgType = this.parentOrgType
    if (orgType === 2) {
      this.titleName = '编辑分公司'
      this.name = '分公司名称'
      this.mesHint = '分公司编辑成功！'
      this.filiale = true
      this.parentDisabled = true
    } else if (orgType === 3) {
      this.titleName = '编辑项目'
      this.name = '项目名称'
      this.mesHint = '项目编辑成功！'
      this.filiale = false
      this.parentDisabled = false
      // 设置上传图片路径
      let params = {
        state: 18,
        user_id: this.userId,
        project_id: this.parentBaseId
      }
      params = this.$qs.stringify(params)
      this.reqUrl = this.sysetApi() + '/upload?' + params
      // 获取项目图片
      this.getProjectImg()
    } else if (orgType === 4) {
      this.titleName = '编辑部门'
      this.name = '部门名称'
      this.mesHint = '部门编辑成功！'
      this.filiale = false
      this.parentDisabled = false
    }
    // 设置头部
    this.reqHead = {
      token: sessionStorage.getItem('wxWebToken'),
      user_id: this.userId
    }
  },
  components: {
    mapModule,
    parentModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 初始化数据
    comInit () {
      // 获取详情
      this.getDetails()
      const orgType = this.parentOrgType
      if (orgType === 2) {
        this.titleName = '编辑分公司'
        this.name = '分公司名称'
        this.mesHint = '分公司编辑成功！'
        this.filiale = true
        this.parentDisabled = true
      } else if (orgType === 3) {
        this.titleName = '编辑项目'
        this.name = '项目名称'
        this.mesHint = '项目编辑成功！'
        this.filiale = false
        this.parentDisabled = false
        // 设置上传图片路径
        let params = {
          state: 18,
          user_id: this.userId,
          project_id: this.parentBaseId
        }
        params = this.$qs.stringify(params)
        this.reqUrl = this.sysetApi() + '/upload?' + params
        // 获取项目图片
        this.getProjectImg()
      } else if (orgType === 4) {
        this.titleName = '编辑部门'
        this.name = '部门名称'
        this.mesHint = '部门编辑成功！'
        this.filiale = false
        this.parentDisabled = false
      }
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
        url: this.sysetApi() + '/v3.2/selOrganizeTreeType',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          this.formData = {
            parentId: itemData.parent_up_id,
            parentName: itemData.parent_up_name || '',
            name: itemData.ogz_name || 1,
            linkman: itemData.user_name || '',
            phone: itemData.ogz_phone || '',
            area: itemData.address || '',
            coord: itemData.coordinate || '',
            remark: itemData.remarks,
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
    // 重置表单
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    // 提交
    sendRequest () {
      let params = {
        user_id: this.userId,
        base_id: this.parentBaseId,
        organize_id: this.parentOrgId,
        organize_type: this.parentOrgType,
        ogz_name: this.formData.name,
        parent_up_id: this.formData.parentId,
        user_name: this.formData.linkman,
        ogz_phone: this.formData.phone,
        address: this.formData.area,
        nature: '',
        area: '',
        industry: '',
        size: '',
        coordinate: this.formData.coord,
        remarks: this.formData.remark,
        ogz_state: this.formData.state
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/altOrganizeTree',
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
    /* 上级机构 */
    parUpdata (data) {
      this.formData.parentName = data.name
      this.formData.parentId = data.id
      this.parDialog = false
    },
    parCancel () {
      this.parDialog = false
    },
    /* 地图坐标 */
    mapUpdata (data) {
      this.formData.coord = data
      this.mapDialog = false
    },
    mapCancel () {
      this.mapDialog = false
    },
    /* 项目图片 */
    // 获取图片
    getProjectImg () {
      let params = {
        project_id: this.parentBaseId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selProPicture',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const imgUrl = res.data.data1 || ''
          if (imgUrl) {
            this.imgUrl = this.sysetApi() + '/showImage?state=18&filename=' + imgUrl
            this.imgBtnTxt = '更换图片'
          } else {
            this.imgUrl = ''
            this.imgBtnTxt = '添加图片'
          }
          this.imgBtn = true
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
    // 上传图片成功
    handleSuccess (res, file, fileList) {
      if (res[0].msg === '0') {
        this.imgUrl = this.sysetApi() + '/showImage?state=18&filename=' + res[0].filename
        this.imgBtnTxt = '更换图片'
        this.$message({
          showClose: true,
          message: '上传图片成功！',
          type: 'success'
        })
      } else {
        this.$message({
          showClose: true,
          message: '上传图片失败！',
          type: 'error'
        })
      }
    },
    // 上传图片失败
    handleError () {
      this.$message({
        showClose: true,
        message: '上传图片失败，请稍后再试！',
        type: 'error'
      })
    }
  },
  watch: {
    parentOrgId (val, old) {
      // 重置表单
      this.resetForm('ruleForm')
      // 获取详情
      this.comInit()
      if (this.parentOrgType === 3) {
        // 设置上传图片路径
        let params = {
          state: 18,
          user_id: this.userId,
          project_id: this.parentBaseId
        }
        params = this.$qs.stringify(params)
        this.reqUrl = this.sysetApi() + '/upload?' + params
        // 获取项目图片
        this.getProjectImg()
      }
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
      button{
        margin: 0 10px;
      }
    }
  }
</style>
