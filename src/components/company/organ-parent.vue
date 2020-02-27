<template>
  <el-dialog title="选择上级机构" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      :highlight-current="highlight"
      default-expand-all
      node-key="id"
      :props="defaultProps"
      @node-click="handleNodeClick">
    </el-tree>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog'],
  data () {
    return {
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      highlight: false,
      checkedId: 0,
      checkedName: '',
      disabled: true
    }
  },
  created () {

  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    // 初始化数据
    parentInit () {
      this.highlight = false
      this.checkedId = ''
      this.checkedName = ''
      if (this.treeData.length === 0) {
        // 获取组织树
        this.getOrganTree()
      }
    },
    // 获取组织树
    getOrganTree () {
      let params = {
        user_id: this.userId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOgzTrees',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          let treeData = res.data.data1
          if (treeData[0].organize_type === 0) {
            treeData = treeData[0].children
          }
          this.treeData = treeData
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
    // 点击节点
    handleNodeClick (data) {
      const type = data.organize_type
      if (type === 1 || type === 2) {
        this.highlight = true
        this.checkedId = data.id
        this.checkedName = data.name
      } else {
        this.highlight = false
        this.checkedId = ''
        this.checkedName = ''
      }
    },
    // 确定
    confirmClick () {
      const id = this.checkedId
      const name = this.checkedName
      const obj = {
        id,
        name
      }
      this.$emit('parentUpdata', obj)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.parentInit()
      }
    },
    checkedId (val, oldVal) {
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
