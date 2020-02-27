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
import { mapState, mapActions } from 'vuex'
export default{
  data () {
    return {
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
      'organizeId',
      'organizeType',
      'projectId'
    ])
  },
  methods: {
    ...mapActions('report', [
      'setReportOrg'
    ]),
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.organizeId === data.id) return
        const type = data.organize_type
        this.$refs.tree.setCheckedKeys([data.id])
        let obj = {}
        if (type === 3) {
          obj = {
            id: data.id,
            type: type,
            proId: data.base_id
          }
        } else {
          obj = {
            id: data.id,
            type: type,
            proId: 0
          }
        }
        // 设置组织参数
        this.setReportOrg(obj)
      } else {
        if (this.orgId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    orgNodeClick (data, node, self) {
      if (data.disabled) return
      if (node.checked) return
      this.$refs.tree.setCheckedKeys([data.id])
      const type = data.organize_type
      let obj = {}
      if (type === 3) {
        obj = {
          id: data.id,
          type: type,
          proId: data.base_id
        }
      } else {
        obj = {
          id: data.id,
          type: type,
          proId: 0
        }
      }
      // 设置组织参数
      this.setReportOrg(obj)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
