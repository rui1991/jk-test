<template>
  <el-dialog title="标准详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-form class="entirety-from" :model="formData" :label-width="formLabelWidth">
      <el-form-item label="模板名称">
        <el-input :disabled="true" v-model="formData.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="模板类型">
        <el-input :disabled="true" v-model="formData.type"></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input :disabled="true" type="textarea" v-model="formData.remark"></el-input>
      </el-form-item>
    </el-form>
    <el-table class="select-table" :data="formData.temData" style="width: 100%" v-show="formData.temData.length > 0">
      <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
      <el-table-column prop="ins_method" class-name="multi-row" label="检查方法"></el-table-column>
      <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
      <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      formLabelWidth: '100px',
      formData: {
        name: '',
        type: '',
        remark: '',
        temData: []
      }
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
    detInit () {
      this.formData = {
        name: '',
        type: '',
        remark: '',
        temData: []
      }
      // 获取详情
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
        url: this.sysetApi() + '/inspection/selTemplateByID',
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
        url: this.sysetApi() + '/inspection/selInsByIds',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let temData = res.data.data1
          this.formData.temData = temData
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
.norm{
  height: 100%;
  .module-container{
    height: 100%;
    padding: 0;
    .module-header{
      padding-left: 0;
      padding-right: 0;
      padding-bottom: 20px;
      .el-breadcrumb{
        padding-top: 15px;
        padding-left: 20px;
        padding-bottom: 15px;
        background: #ffffff;
      }
    }
    .module-main{
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .search{
        padding: 5px 0;
        .search-input{
          display: table;
          width: 100%;
          .item{
            display: table-cell;
            vertical-align: middle;
            width: 280px;
            font-size: 0;
            span{
              width: 70px;
              display: inline-block;
              line-height: 34px;
              font-size: 14px;
            }
          }
          .operate{
            display: table-cell;
            vertical-align: middle;
            text-align: right;
          }
        }
      }
    }
  }
}
</style>
