<template>
  <el-dialog title="选择上级机构" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      show-checkbox
      check-strictly
      check-on-click-node
      node-key="id"
      ref="tree"
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
