<template>
  <el-dialog title="选择人员" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-input class="search" placeholder="请输入人员姓名" prefix-icon="el-icon-search" v-model.trim="crewFilter"></el-input>
    <el-table  class="select-table" :data="crewTable" style="width: 100%" max-height="360">
      <el-table-column width="65">
        <template slot-scope="scope">
          <el-radio :label="scope.row.user_id" @change="selectChange(scope.row.user_name)" v-model="id">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="user_name" label="姓名"></el-table-column>
      <el-table-column prop="user_phone" label="联系方式"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="submitClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentSector', 'parentType'],
  data () {
    return {
      crewTable: [],
      ocrewTable: [],
      crewFilter: '',
      id: '',
      name: '',
      disabled: false
    }
  },
  created () {

  },
  mounted () {

  },
  computed: {
    ...mapState('user', [
      'userId',
      'userName'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    // 初始化数据
    modInit () {
      this.crewFilter = ''
      this.id = ''
      this.name = ''
    },
    crewInit () {
      this.crewTable = []
      this.ocrewTable = []
      // 获取人员
      this.getCrewData()
    },
    // 获取部门人员
    getCrewData () {
      let orgId = 0
      if (this.parentSector) {
        orgId = this.parentSector
      }
      let params = {
        project_id: this.projectId,
        ogz_id: orgId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.7/selUserByOgz',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.crewTable = res.data.data1
          this.ocrewTable = res.data.data1
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
    // 选择人员
    selectChange (name) {
      this.name = name
    },
    // 确定
    submitClick () {
      if (this.parentType === 1) {
        this.submitDispatch()
      } else if (this.parentType === 2) {
        this.submitTrade()
      }
    },
    // 提交派遣
    submitDispatch () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        user_name: this.userName,
        project_id: this.projectId,
        id_id: this.parentId,
        type: 1,
        userN_name: this.name,
        userN_id: this.id
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/reqInsTask',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '派遣成功',
            type: 'success'
          })
          // 更新列表数据
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
    // 提交换人
    submitTrade () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        id_id: this.parentId,
        userN_id: this.id
      }
      params = this.$qs.stringify(params)
      this.disabled = true
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/v2.1.02/all/alter/alterInsTaskUser',
        data: params
      }).then((res) => {
        this.disabled = false
        if (res.data.result === 'Sucess') {
          this.$message({
            showClose: true,
            message: '换人成功',
            type: 'success'
          })
          // 更新列表数据
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
        this.modInit()
      }
    },
    parentSector (val, oldVal) {
      this.crewInit()
    },
    crewFilter (val, oldVal) {
      this.crewTable = this.ocrewTable.filter(item => (~item.user_name.indexOf(val)))
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
