<template>
  <el-dialog title="选择上级机构" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <div style="padding: 5px;">
      <el-input
        placeholder="输入关键字进行过滤"
        clearable
        v-model="filterText">
      </el-input>
    </div>
    <el-tree
      :data="treeData"
      show-checkbox
      check-strictly
      check-on-click-node
      node-key="id"
      ref="tree"
      :filter-node-method="filterNode"
      @check-change="orgCheckChange"
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
  props: ['parentDialog', 'parentName', 'parentId'],
  data () {
    return {
      filterText: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
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
      this.filterText = ''
      if (this.treeData.length === 0) {
        // 获取组织树
        this.getOrganTree()
      } else {
        const id = this.parentId
        this.checkedId = id
        this.checkedName = this.parentName
        setTimeout(() => {
          this.$refs.tree.setCheckedKeys([id])
        }, 100)
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
        url: '/ezx_jk/v3.2/selOgzTrees',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 组织树
          let treeData = res.data.data1
          this.treeData = this.recOrganData(treeData)
          const id = this.parentId
          this.checkedId = id
          this.checkedName = this.parentName
          setTimeout(() => {
            this.$refs.tree.setCheckedKeys([id])
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
    // 设置项目部门不可选
    recOrganData (data) {
      data.forEach((item, index, array) => {
        if (item.organize_type === 3 || item.organize_type === 4) {
          item.disabled = true
        }
        if (item.children) {
          this.recOrganData(item.children)
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
    // 点击节点
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.checkedId === data.id) {
          return
        }
        this.checkedId = data.id
        this.checkedName = data.name
        this.$refs.tree.setCheckedKeys([data.id])
      } else {
        if (this.checkedId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
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
    filterText (val, oldVal) {
      this.$refs.tree.filter(val)
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
