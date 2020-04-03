<template>
  <el-dialog title="关联标准" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-input placeholder="请输入标准名称" prefix-icon="el-icon-search" v-model="filterName" style="width: 40%; margin-bottom: 10px;"></el-input>
    <el-table class="select-table" :data="tableData" style="width: 100%" max-height="360">
      <el-table-column label="" width="65">
        <template slot-scope="scope">
          <el-radio v-model="id" :label="scope.row.template_id">&nbsp;&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="template_name" label="标准名称"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="sendRequest">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      tableData: [],
      otableData: [],
      dataState: false,
      filterName: '',
      id: '',
      disabled: true
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
    addInit () {
      this.filterName = ''
      this.id = ''
      if (!this.dataState) {
        this.getNormData()
      }
    },
    getNormData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        projectN_id: this.projectId,
        templateN_name: '',
        templateN_type: '',
        createN_time: '',
        createN_user: '',
        page: 1,
        limit1: 1000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/selTemplateBySearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1.templates
          this.otableData = res.data.data1.templates
          this.dataState = true
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
    // 提交
    sendRequest () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.parentId,
        template_id: this.id
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/addPositionTem',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
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
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.addInit()
      }
    },
    filterName (val, oldVal) {
      this.tableData = this.otableData.filter(item => (~item.template_name.indexOf(val)))
    },
    id (val, oldVal) {
      if (val) {
        this.disabled = false
      } else {
        this.disabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
