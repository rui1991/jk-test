<template>
  <div class="position-module">
    <h3 class="title">编辑位置</h3>
    <el-form :model="formData" :rules="rules" ref="ruleForm" :label-width="formLabelWidth">
      <el-form-item label="上级位置" prop="parent">
        <el-input :disabled="true" v-model="formData.parent"></el-input>
      </el-form-item>
      <el-form-item label="位置类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择位置类型">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="位置名称" prop="name">
        <el-input v-model.trim="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="位置ID" prop="id">
        <el-input :disabled="true" v-model="formData.id" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" maxlength="100" placeholder="文本长度不得超过100个字符" v-model.trim="formData.remark"></el-input>
      </el-form-item>
      <el-form-item label="位置状态" prop="state">
        <el-switch v-model="formData.state" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
      </el-form-item>
    </el-form>
    <el-upload
      class="upload-demo"
      :action="reqUrl"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :file-list="fileList"
      :multiple="false"
      :limit="imgLimit"
      list-type="picture">
      <span style="display: inline-block; width: 100px; text-align: right; padding-right: 12px;">图片</span>
      <el-button size="small" type="primary" @click="imgUrl = ''">{{ upImgText }}</el-button>
      <div slot="tip" class="el-upload__tip" style="padding-left: 120px; color: red;">只能上传单张jpg/png文件，大小不超过2048kb！</div>
    </el-upload>
    <div class="show-img">
      <div class="images" v-if="imgUrl">
        <img :src="imgUrl" height="120" alt="">
      </div>
      <!--<p class="img-hint" v-else>未上传图片</p>-->
    </div>
    <div class="operate">
      <el-button type="primary" :disabled="disabled" @click="submitForm('ruleForm')">确 定</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentId'],
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
        ]
      },
      formData: {
        parent: '',
        type: '',
        name: '',
        id: 0,
        remark: '',
        state: true,
        picture: ''
      },
      upImgText: '上传图片',
      imgUrl: '',
      reqUrl: '',
      imgLimit: 1,
      fileList: [],
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
    comInit () {
      this.fileList = []
      this.imgUrl = ''
      this.upImgText = '上传图片'
      this.formData = {
        parent: '',
        type: '',
        name: '',
        id: 0,
        remark: '',
        state: true,
        picture: ''
      }
      this.getDetails()
    },
    // 获取详情
    getDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        location_id: this.parentId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/location/v1.0/selLocationByID',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 状态
          const stateCode = itemData.location_state
          let state = true
          if (stateCode === 0) {
            state = true
          } else if (stateCode === 1) {
            state = false
          }
          // 图片
          let picture = itemData.picture || ''
          let imgUrl = ''
          let upImgText = '上传图片'
          if (picture) {
            upImgText = '重新上传'
            imgUrl = '/ezx_jk/showImage?state=10&filename=' + picture
          }
          this.imgUrl = imgUrl
          this.upImgText = upImgText
          this.formData = {
            parent: itemData.parent_location_name || '',
            type: itemData.location_type,
            name: itemData.location_name,
            id: itemData.location_id,
            remark: itemData.remark,
            state: state,
            picture: picture
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
      // 状态
      const state = this.formData.state
      let stateCode = 1
      if (state) {
        stateCode = 0
      }
      let picture = this.formData.picture
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        location_id: this.parentId,
        location_type: this.formData.type,
        location_name: this.formData.name,
        remark: this.formData.remark,
        location_state: stateCode,
        pictures: picture
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/location/v1.0/altLocation',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '位置编辑成功！',
            type: 'success'
          })
          let imgUrl = ''
          let upImgText = '上传图片'
          if (picture) {
            upImgText = '重新上传'
            imgUrl = '/ezx_jk/showImage?state=10&filename=' + picture
          }
          this.imgUrl = imgUrl
          this.upImgText = upImgText
          this.fileList = []
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
    // 上传图片成功
    handleSuccess (res, file, fileList) {
      this.formData.picture = res
      this.fileList = fileList
    },
    // 上传图片失败
    handleError () {
      this.$message({
        showClose: true,
        message: '上传图片失败，请稍后再试！',
        type: 'error'
      })
    },
    // 删除图片
    handleRemove (file, fileList) {
      this.formData.picture = ''
      this.fileList = fileList
    }
  },
  watch: {
    parentId (val, oldVal) {
      if (val) {
        this.comInit()
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
