<template>
  <el-dialog title="选择授权范围" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      show-checkbox
      default-expand-all
      check-strictly
      node-key="id"
      ref="tree"
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
  props: ['parentDialog', 'parentId'],
  data () {
    return {
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
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
    accreditInit () {
      if (this.treeData.length === 0) {
        // 获取组织树
        this.getOrganTree()
        return
      }
      setTimeout(() => {
        this.$refs.tree.setCheckedKeys([this.parentId])
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
          let orgTree = res.data.data1
          if (orgTree[0].organize_type === 0) {
            orgTree = orgTree[0].children
          }
          const sectorData = this.initDisTree(orgTree)
          this.treeData = sectorData
          // 选择已选中
          setTimeout(() => {
            this.$refs.tree.setCheckedKeys(this.parentId)
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
    // 处理树
    initDisTree (treeData) {
      treeData.forEach(item => {
        if (item.organize_type === 4) {
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
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecTree(item.children)
        }
      })
    },
    // 确定
    confirmClick () {
      // 获取选中节点
      const nodesData = this.$refs.tree.getCheckedNodes()
      // 获取选中id
      const keysData = this.$refs.tree.getCheckedKeys()
      if (keysData.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择授权范围！',
          type: 'warning'
        })
        return
      }
      let ids = []
      let names = []
      // 全部
      const allNode = nodesData.find(item => {
        return item.organize_type === 0
      })
      const firmNode = nodesData.find(item => {
        return item.organize_type === 1
      })
      if (allNode) {
        ids.push(allNode.id)
        names.push(allNode.name)
      } else if (firmNode) {
        ids.push(firmNode.id)
        names.push(firmNode.name)
      } else {
        nodesData.forEach(node => {
          const parentId = node.parent_id
          const state = keysData.find(id => {
            return id === parentId
          })
          if (state === undefined) {
            ids.push(node.id)
            names.push(node.name)
          }
        })
      }
      names = names.join('、')
      const obj = {
        ids,
        names
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
        this.accreditInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
