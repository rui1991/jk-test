<template>
  <el-dialog title="导入地址" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div class="up-file">
      <span class="txt">导入文件</span>
      <el-upload
        class="upload-demo"
        :action="reqUrl"
        :headers="reqHead"
        :on-success="upFileSuccess"
        :on-error="upFileError"
        :multiple="false"
        :file-list="fileList">
        <el-button size="small" type="primary">点击导入</el-button>
      </el-upload>
      <p class="up-hint">注：请提前按照模板文件<a href="javascript:;" class="blue" @click="downTemplate">excel示例</a>的格式编辑地址信息</p>
      <!--<p class="up-hint">&nbsp;&nbsp;&nbsp;&nbsp;2.导入的用户文件仅支持excel文件</p>-->
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog'],
  data () {
    return {
      reqUrl: '',
      reqHead: {
        token: '',
        user_id: 0
      },
      fileList: []
    }
  },
  created () {
    // 设置上传参数
    this.reqHead = {
      token: sessionStorage.getItem('wxWebToken'),
      user_id: this.userId
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
    upInit () {
      let params = {
        state: 17,
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      const reqUrl = this.sysetApi() + '/upload?' + params
      this.reqUrl = reqUrl
      // 清空导入文件提示
      this.fileList = []
    },
    // 成功
    upFileSuccess (data) {
      if (data[0].msg === '0') {
        this.$message({
          showClose: true,
          message: '文件导入成功',
          type: 'success'
        })
        // 更新数据
        this.$emit('parentUpdata')
      } else if (data[0].msg === '1') {
        this.$message({
          showClose: true,
          message: '请检查文档填写是否符合规范且名称和MAC地址是否重复！',
          type: 'error'
        })
      } else {
        this.$message({
          showClose: true,
          message: '文件导入失败！',
          type: 'error'
        })
      }
    },
    // 失败
    upFileError () {
      this.$message({
        showClose: true,
        message: '文件导入失败！',
        type: 'error'
      })
    },
    // 下载模板
    downTemplate () {
      window.location.href = this.sysetApi() + '/v3.7.3/poModelEO?project_id=' + this.projectId
    },
    // 关闭
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.upInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.site{
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
    .module-content{
      height: 100%;
      padding-top: 10px;
      padding-right: 0;
      padding-bottom: 10px;
      padding-left: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .module-aside{
        height: 100%;
        padding: 5px;
        border-radius: 6px;
        border: 1px solid #cccccc;
      }
      .module-main{
        padding-top: 0;
        padding-right: 10px;
        padding-bottom: 0;
        padding-left: 20px;
        overflow: scroll;
        .search{
          padding-top: 5px;
          padding-bottom: 5px;
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
  .mult-dialog{
    .el-dialog__header{
      display: none;
    }
  }
}
</style>
