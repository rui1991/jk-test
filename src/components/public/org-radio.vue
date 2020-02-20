<template>
  <el-tree
    :data="orgData"
    ref="tree"
    show-checkbox
    default-expand-all
    check-strictly
    node-key="id"
    @check-change="orgCheckChange"
    @node-click="orgNodeClick"
    :props="defaultProps">
  </el-tree>
</template>

<script>
import { mapState } from 'vuex'
export default{
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      organizeId: 0
    }
  },
  computed: {
    ...mapState('other', [
      'orgData'
    ])
  },
  methods: {
    // 点击组织树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.organizeId === data.id) return
        this.$refs.tree.setCheckedKeys([data.id])
        this.organizeId = data.id
        // 类型
        const type = data.organize_type
        let projectId = 0
        if (type === 3) {
          projectId = data.base_id
        }
        const obj = {
          id: data.id,
          name: data.name,
          type: type,
          projectId: projectId
        }
        this.$emit('parentUpdata', obj)
      } else {
        if (this.organizeId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    orgNodeClick (data, node, self) {
      if (data.disabled) return
      if (node.checked) return
      this.$refs.tree.setCheckedKeys([data.id])
      this.organizeId = data.id
      // 类型
      const type = data.organize_type
      let projectId = 0
      if (type === 3) {
        projectId = data.base_id
      }
      const obj = {
        id: data.id,
        name: data.name,
        type: type,
        projectId: projectId
      }
      this.$emit('parentUpdata', obj)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
