<template>
  <el-dialog title="选择授权范围" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div style="padding: 5px;">
      <el-input
        placeholder="输入关键字进行过滤"
        clearable
        v-model="filterText">
      </el-input>
    </div>
    <el-tree
      :data="treeData"
      ref="tree"
      show-checkbox
      check-strictly
      check-on-click-node
      node-key="id"
      :filter-node-method="filterNode"
      @check-change="orgCheckChange"
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
      filterText: '',
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
      this.filterText = ''
      if (this.treeData.length === 0) {
        // 获取组织树
        this.getOrganTree()
        return
      }
      setTimeout(() => {
        let treeData = JSON.parse(JSON.stringify(this.treeData))
        let newNode = this.subDisTree(treeData, false)
        this.treeData = newNode
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
        url: '/ezx_jk/v3.2/selOgzTrees',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          let orgTree = res.data.data1
          const sectorData = this.initRecursionTree(orgTree)
          this.treeData = sectorData
          // 选择已选中
          // setTimeout(() => {
          //   this.$refs.tree.setCheckedKeys(this.parentId)
          // }, 100)
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
    initRecursionTree (data) {
      data.forEach(item => {
        if (item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecursionTree(item.children)
        }
      })
      return data
    },
    // 触发页面显示配置的筛选
    filterNode (value, data, node) {
      // 如果什么都没填就直接返回
      if (!value) return true
      // 如果传入的value和data中的label相同说明是匹配到了
      if (data.name.indexOf(value) !== -1) return true
      // 否则要去判断它是不是选中节点的子节点
      return this.checkBelongNode(value, data, node)
    },
    // 判断传入的节点是不是选中节点的子节点
    checkBelongNode (value, data, node) {
      const level = node.level
      // 如果传入的节点本身就是一级节点就不用校验了
      if (level === 1) return false
      // 先取当前节点的父节点
      let parentData = node.parent
      // 遍历当前节点的父节点
      let index = 0
      while (index < level - 1) {
        // 如果匹配到直接返回
        if (parentData.data.name.indexOf(value) !== -1) {
          return true
        }
        // 否则的话再往上一层做匹配
        parentData = parentData.parent
        index++
      }
      // 没匹配到返回false
      return false
    },
    // 选择组织树
    orgCheckChange (data, checked, self) {
      if (data.disabled) {
        return
      }
      if (data.children) {
        // 下级不可选
        let inNode = JSON.parse(JSON.stringify(data.children))
        let node = this.subDisTree(inNode, checked)
        data.children = node
        this.$refs.tree.updateKeyChildren(data.id, data)
        // 清除下级选中状态
        if (checked) {
          this.clearCheTree(data.children)
        }
      }
    },
    // 下级不可选
    subDisTree (data, b) {
      data.forEach((item, index, array) => {
        if (item.organize_type !== 4) {
          item.disabled = b
        }
        if (item.children) {
          this.subDisTree(item.children, b)
        }
      })
      return data
    },
    // 清除下级选中状态
    clearCheTree (data) {
      data.forEach((item, index, array) => {
        this.$refs.tree.setChecked(item.id, false)
        if (item.children) {
          this.clearCheTree(item.children)
        }
      })
      return data
    },
    // 确定
    confirmClick () {
      // 获取选中节点
      const nodesData = this.$refs.tree.getCheckedNodes()
      if (nodesData.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择授权范围！',
          type: 'warning'
        })
        return
      }
      let ids = []
      let names = []
      nodesData.forEach(item => {
        ids.push(item.id)
        names.push(item.name)
      })
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
    },
    filterText (val, oldVal) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
