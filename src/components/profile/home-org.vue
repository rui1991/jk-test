<template>
  <el-dialog title="选择组织机构" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
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
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentId', 'parentName'],
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      organizeId: 0,
      organizeName: '',
      disabled: true
    }
  },
  created () {

  },
  computed: {
    ...mapState('other', [
      'orgData'
    ])
  },
  methods: {
    // 初始化数据
    orgInit () {
      this.organizeId = this.parentId
      this.organizeName = this.parentName
      setTimeout(() => {
        this.$refs.tree.setCheckedKeys([this.organizeId])
      }, 100)
    },
    // 点击机构树
    orgCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.organizeId === data.id) return
        this.$refs.tree.setCheckedKeys([data.id])
        this.organizeId = data.id
        this.organizeName = data.name
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
      this.organizeName = data.name
    },
    // 确定
    confirmClick () {
      const obj = {
        id: this.organizeId,
        name: this.organizeName
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
        this.orgInit()
      }
    },
    organizeId (val, oldVal) {
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
