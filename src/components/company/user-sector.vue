<template>
  <el-dialog title="选择部门" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      show-checkbox
      default-expand-all
      check-strictly
      node-key="id"
      ref="tree"
      @check-change="checkChange"
      :props="defaultProps">
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
      checkedOrgId: '',
      checkedId: '',
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
    sectorInit () {
      this.checkedOrgId = ''
      this.checkedId = ''
      this.checkedName = ''
      if (this.treeData.length === 0) {
        // 获取组织树
        this.getOrganTree()
        return
      }
      setTimeout(() => {
        this.$refs.tree.setCheckedKeys([])
      }, 100)
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
          const orgTree = res.data.data1
          const sectorData = this.initDisTree(orgTree)
          this.treeData = sectorData
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
    // 处理树
    initDisTree (treeData) {
      treeData.forEach(item => {
        if (item.organize_type !== 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecTree(item.children)
        }
      })
      return treeData
    },
    initRecTree (data) {
      data.forEach(item => {
        if (item.organize_type !== 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecTree(item.children)
        }
      })
    },
    // 选择
    checkChange (data, checked, self) {
      if (checked === true) {
        this.checkedOrgId = data.id
        this.checkedId = data.base_id
        this.checkedName = data.name
        this.$refs.tree.setCheckedKeys([data.id])
      } else {
        if (this.checkedOrgId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    // 确定
    confirmClick () {
      const id = this.checkedId || ''
      const name = this.checkedName || ''
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
        this.sectorInit()
      }
    },
    checkedOrgId (val, oldVal) {
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
