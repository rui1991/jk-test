<template>
  <!-- 位置 -->
  <el-dialog title="选择位置" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-tree
      :data="posTree"
      :highlight-current="posHighlight"
      default-expand-all
      node-key="id"
      :props="defaultProps"
      @node-click="posTreeClick">
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
  props: ['parentDialog'],
  data () {
    return {
      posDialog: false,
      posTree: [],
      posState: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      checkedPosId: '',
      checkedPosName: '',
      posHighlight: true
    }
  },
  created () {

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
    // 初始化数据
    posInit () {
      if (!this.posState) {
        // 获取位置数
        setTimeout(() => {
          this.getPositionTree()
        }, 100)
      } else {
        // 清空选中项
        this.checkedPosId = ''
        this.checkedPosName = ''
        // 取消高亮
        this.posHighlight = false
      }
    },
    // 获取位置树
    getPositionTree () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/location/v1.0/selLocationTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.posTree = res.data.data1
          this.posState = true
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
    // 点击树
    posTreeClick (data) {
      // 设置选中id
      this.checkedPosId = data.id
      this.checkedPosName = data.name
      // 设置高亮
      this.posHighlight = true
    },
    // 确定
    confirmClick () {
      const id = this.checkedPosId || ''
      const name = this.checkedPosName || ''
      const obj = {
        id,
        name
      }
      this.$emit('parentSelect', obj)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.posInit()
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
