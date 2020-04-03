<template>
  <el-dialog title="选择地址" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="treeData"
      ref="tree"
      show-checkbox
      default-expand-all
      check-strictly
      node-key="id"
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
  props: ['parentDialog', 'parentIds'],
  data () {
    return {
      treeData: [],
      treeState: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId'
    ])
  },
  methods: {
    siteInit () {
      if (this.treeState) {
        let ids = this.parentIds
        setTimeout(() => {
          this.$refs.tree.setCheckedKeys(ids)
        }, 100)
      } else {
        this.getTreeData()
      }
    },
    // 获取地址树
    getTreeData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/selPositionTree628',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const siteData = res.data.data1
          // 处理地址树
          const treeData = this.initDisTree(siteData)
          this.treeData = treeData
          this.treeState = true
          let ids = this.parentIds
          setTimeout(() => {
            this.$refs.tree.setCheckedKeys(ids)
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
    // 初始化处理地址树
    initDisTree (siteData) {
      siteData.forEach(item => {
        let id = item.id
        if (id.indexOf('w') !== -1) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecTree(item.children)
        }
      })
      return siteData
    },
    initRecTree (data) {
      data.forEach(item => {
        let id = item.id
        if (id.indexOf('w') !== -1) {
          item.disabled = true
        }
        if (item.children) {
          this.initRecTree(item.children)
        }
      })
    },
    // 确定
    confirmClick () {
      const nodesData = this.$refs.tree.getCheckedNodes()
      let siteName = []
      let siteId = []
      nodesData.forEach(item => {
        siteName.push(item.name)
        siteId.push(item.id)
      })
      siteName = siteName.join('、')
      const obj = {
        names: siteName,
        ids: siteId
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
        this.siteInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
