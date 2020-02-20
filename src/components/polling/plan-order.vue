<template>
  <div class="plan-order">
    <div class="order">
      <span>巡检顺序</span>
      <el-radio-group v-model="parentSite.order">
        <el-radio :label="0">随机顺序</el-radio>
        <el-radio :label="1">固定顺序</el-radio>
      </el-radio-group>
    </div>
    <p class="hint">提示：可通过拖拽来调整巡检顺序！</p>
    <el-table class="strip-table" :data="tableData" row-key="position_id" max-height="520" border style="width: 100%">
      <el-table-column label="地址">
        <template slot-scope="scope">
          <span style="cursor: pointer;">{{ scope.row.position_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <i class="iconfont icon-ketuozhuai"></i>
        </template>
      </el-table-column>
    </el-table>
    <div class="operate">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="backClick">上一步</el-button>
      <el-button type="primary" :disabled="parentBtnState" @click="saveClick">保 存</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Sortable from 'sortablejs'
export default{
  props: ['parentSite', 'parentBtnState'],
  data () {
    return {
      tableData: []
    }
  },
  created () {
    // 获取地址数据
    this.getSiteData()
  },
  mounted () {
    this.rowDrop()
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
    // 获取地址数据
    getSiteData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_ids: this.parentSite.positions.join(',')
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsSetPositionsTemplate',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.tableData = res.data.data1
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
    // 行拖拽
    rowDrop () {
      const tbody = document.querySelector('.el-table__body-wrapper tbody')
      const _this = this
      Sortable.create(tbody, {
        onEnd ({ newIndex, oldIndex }) {
          const currRow = _this.tableData.splice(oldIndex, 1)[0]
          _this.tableData.splice(newIndex, 0, currRow)
        }
      })
    },
    // 上一步
    backClick () {
      this.$emit('parentActiveFun', 2)
    },
    // 保存
    saveClick () {
      let siteData = []
      const order = this.parentSite.order
      if (order === 1) {
        const tableData = this.tableData
        tableData.forEach(item => {
          siteData.push(item.position_id)
        })
      } else {
        siteData = this.parentSite.positions
      }
      const args = {
        siteData: siteData,
        order: order
      }
      this.$emit('parentSaveFun', args)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancelFun')
    }
  }
}
</script>

<style lang="less" scoped>
.plan-order{
  width: 720px;
  padding: 20px;
  margin: 0 auto;
  background: #ffffff;
  .order{
    height: 45px;
    line-height: 45px;
    span{
      margin-right: 30px;
    }
  }
  .strip-table{
    i{
      cursor: pointer;
    }
  }
  .hint{
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    color: red;
  }
  .operate{
    margin-top: 30px;
    text-align: center;
    .el-button{
      margin: 0 20px;
    }
  }
}
</style>
