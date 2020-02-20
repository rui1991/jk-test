<template>
  <el-dialog title="选择标准" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      ref="tree"
      default-expand-all
      node-key="id"
      show-checkbox
      check-strictly
      :props="defaultProps">
    </el-tree>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentIds'],
  data () {
    return {
      treeState: false,
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId'
    ])
  },
  methods: {
    temInit () {
      if (this.treeState) {
        setTimeout(() => {
          let ids = this.parentIds.split(',')
          this.$refs.tree.setCheckedKeys(ids)
        }, 100)
      } else {
        this.getTemData()
      }
    },
    // 获取标准模板
    getTemData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selInsTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let treeData = res.data.data1
          treeData.forEach(item => {
            item.disabled = true
          })
          this.treeData = treeData
          this.treeState = true
          setTimeout(() => {
            let ids = this.parentIds.split(',')
            this.$refs.tree.setCheckedKeys(ids)
          }, 100)
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
    // 确定
    confirmClick () {
      let temIds = this.$refs.tree.getCheckedKeys()
      if (temIds.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择巡检标准',
          type: 'warning'
        })
        return
      }
      temIds = temIds.join(',')
      this.$emit('parentUpdata', temIds)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.temInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
