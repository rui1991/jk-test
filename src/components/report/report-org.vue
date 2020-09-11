<template>
  <div>
    <div style="padding-bottom: 5px;">
      <el-input
        placeholder="输入关键字进行过滤"
        clearable
        v-model="filterText">
      </el-input>
    </div>
    <el-tree
      :data="orgData"
      ref="tree"
      show-checkbox
      check-strictly
      check-on-click-node
      node-key="id"
      :filter-node-method="filterNode"
      @check-change="orgCheckChange"
      :props="defaultProps">
    </el-tree>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default{
  data () {
    return {
      filterText: '',
      organizeId: 0,
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created () {

  },
  mounted () {
    // if (this.organizeId) {
    //   this.$refs.tree.setCheckedKeys([this.organizeId])
    // }
  },
  computed: {
    ...mapState('other', [
      'orgData'
    ]),
    ...mapState('report', [
      'organizeType',
      'projectId'
    ])
  },
  methods: {
    ...mapActions('report', [
      'setReportOrg'
    ]),
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
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.organizeId === data.id) return
        this.organizeId = data.id
        this.$refs.tree.setCheckedKeys([data.id])
        // 设置组织参数
        this.$emit('parentUporg', data.id)
      } else {
        if (this.organizeId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    }
  },
  watch: {
    filterText (val, oldVal) {
      this.$refs.tree.filter(val)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
