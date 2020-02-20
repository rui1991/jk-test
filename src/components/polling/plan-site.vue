<template>
  <div class="plan-site">
    <div class="site-container">
      <div class="tree">
        <h3 class="title">地址信息</h3>
        <div class="site-tree">
          <el-tree
            style="width: 280px;"
            :data="siteTree"
            ref="siteTree"
            node-key="id"
            show-checkbox
            :props="defaultProps">
          </el-tree>
        </div>
        <p class="hint">提示：先勾选地址，后通过右侧操作按钮选择地址！</p>
      </div>
      <div class="move">
        <div style="margin: 10px 0; text-align: center;">
          <el-button type="primary" icon="el-icon-arrow-right" circle @click="addListData"></el-button>
        </div>
        <div style="margin: 10px 0; text-align: center;">
          <el-button type="primary" icon="el-icon-arrow-left" circle @click="remListData"></el-button>
        </div>
      </div>
      <div class="table">
        <h3 class="title">已选择地址列表</h3>
        <el-table class="select-table" :data="tableData" @selection-change="handleSelectionChange" max-height="420" stripe style="width: 100%">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="position_name" label="地址名称"></el-table-column>
          <el-table-column label="关联标准">
            <template slot-scope="scope">
              <span v-if="scope.row.template_id">{{ scope.row.template_name }}</span>
              <span v-else>无</span>
            </template>
          </el-table-column>
        </el-table>
        <p class="hint">提示：先勾选地址，后通过左侧操作按钮移除地址！</p>
      </div>
    </div>
    <div class="operate">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="backClick">上一步</el-button>
      <el-button type="primary" @click="submitForm">下一步</el-button>
    </div>

  </div>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentSite'],
  data () {
    return {
      ositeTree: [],
      siteTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      tableData: [],
      multipleSelection: [],
      operationIds: []
    }
  },
  created () {
    // 获取地址树
    this.getSiteTree()
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
    // 获取地址树
    getSiteTree () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPositionTree628',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const siteData = res.data.data1
          // exetype: 1 执行人员    2 执行组
          const siteType = this.parentSite.exetype
          if (siteType === 1) {
            // 处理地址树
            const siteTree = this.initDisPerson(siteData)
            this.siteTree = siteTree
          } else if (siteType === 2) {
            // 处理地址树
            const siteTree = this.initDisGroup(siteData)
            this.siteTree = siteTree
          }
          // 获取选中信息
          if (this.parentSite.positions.length > 0) {
            this.getListData(this.parentSite.positions)
          }
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
    /* 初始化执行人处理地址树 */
    initDisPerson (siteData) {
      siteData.forEach(item => {
        if (item.id.indexOf('w') !== -1) {
          item.disabled = false
        } else {
          if (item.mac && Number.parseInt(item.type) === 0) {
            item.disabled = false
          } else {
            item.disabled = true
          }
        }
        if (item.children) {
          this.initRecPerson(item.children)
        }
      })
      return siteData
    },
    initRecPerson (data) {
      data.forEach(item => {
        if (item.id.indexOf('w') !== -1) {
          item.disabled = false
        } else {
          if (item.mac && Number.parseInt(item.type) === 0) {
            item.disabled = false
          } else {
            item.disabled = true
          }
        }
        if (item.children) {
          this.initRecPerson(item.children)
        }
      })
    },
    /* 初始化执行组处理地址树 */
    initDisGroup (siteData) {
      siteData.forEach(item => {
        if (item.id.indexOf('w') !== -1) {
          item.disabled = false
        } else {
          if (Number.parseInt(item.type) === 0) {
            if (item.mac.length === 12) {
              item.disabled = false
            } else {
              item.disabled = true
            }
          } else {
            item.disabled = true
          }
        }
        if (item.children) {
          this.initRecGroup(item.children)
        }
      })
      return siteData
    },
    initRecGroup (data) {
      data.forEach(item => {
        if (item.id.indexOf('w') !== -1) {
          item.disabled = false
        } else {
          if (Number.parseInt(item.type) === 0) {
            if (item.mac.length === 12) {
              item.disabled = false
            } else {
              item.disabled = true
            }
          } else {
            item.disabled = true
          }
        }
        if (item.children) {
          this.initRecGroup(item.children)
        }
      })
    },
    // 获取选中项
    handleSelectionChange (data) {
      this.multipleSelection = data
    },
    // 添加到列表
    addListData () {
      let nodes = this.$refs.siteTree.getCheckedNodes()
      let siteIds = []
      nodes.forEach(item => {
        if (item.id.indexOf('w') === -1) {
          siteIds.push(item.id)
        }
      })
      if (siteIds.length === 0) {
        this.$message({
          showClose: true,
          message: '请先选择左侧地址',
          type: 'warning'
        })
        return
      }
      this.getListData(siteIds)
    },
    getListData (ids) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_ids: ids.join(',')
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/selInsSetPositions',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const listDta = res.data.data1
          this.tableData = this.tableData.concat(listDta)
          // 清空左侧选中
          this.$refs.siteTree.setCheckedKeys([])
          // 左边不可选择
          this.operationIds = ids
          this.disposeSiteTree()
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
    // 移除列表
    remListData () {
      const siteIds = this.multipleSelection
      if (siteIds.length === 0) {
        this.$message({
          showClose: true,
          message: '请先选择右侧地址',
          type: 'warning'
        })
        return
      }
      let ids = []
      siteIds.forEach(item => {
        ids.push(item.position_id)
      })
      // 移除右侧
      for (let i = 0; i < siteIds.length; i++) {
        this.tableData.forEach((item, index) => {
          if (ids[i] === item.position_id) {
            this.tableData.splice(index, 1)
          }
        })
      }
      // 左边可选择
      this.operationIds = ids
      this.disposeSiteTree()
    },
    // 操作处理地址树
    disposeSiteTree () {
      let ids = this.operationIds
      let siteData = JSON.parse(JSON.stringify(this.siteTree))
      siteData.forEach(item => {
        for (let i = 0; i < ids.length; i++) {
          if (item.id == ids[i]) {
            item.disabled = !item.disabled
            break
          }
        }
        if (item.children) {
          this.recursionSiteTree(item.children)
        }
      })
      this.siteTree = siteData
    },
    recursionSiteTree (data) {
      let ids = this.operationIds
      data.forEach(item => {
        for (let i = 0; i < ids.length; i++) {
          if (item.id == ids[i]) {
            item.disabled = !item.disabled
            break
          }
        }
        if (item.children) {
          this.recursionSiteTree(item.children)
        }
      })
    },
    // 上一步
    backClick () {
      this.$emit('parentActiveFun', 0)
    },
    // 下一步
    submitForm () {
      let siteData = []
      if (this.tableData.length === 0) {
        this.$message({
          showClose: true,
          message: '请选择地址',
          type: 'warning'
        })
        return
      }
      this.tableData.forEach((item, index) => {
        siteData.push(item.position_id)
      })
      this.$emit('parentSiteFun', siteData)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancelFun')
    }
  }
}
</script>

<style lang="less" scoped>
.plan-site{
  width: 80%;
  margin: 0 auto;
  .site-container{
    width: 100%;
    display: table;
    font-size: 0;
    .title{
      height: 35px;
      line-height: 35px;
      font-size: 14px;
    }
    .tree{
      display: table-cell;
      vertical-align: top;
      width: 300px;
      .site-tree{
        height: 480px;
        padding: 5px;
        border-radius: 6px;
        border: 1px solid #dcdcdc;
        overflow: auto;
      }
    }
    .move{
      display: table-cell;
      vertical-align: middle;
    }
    .table{
      display: table-cell;
      vertical-align: top;
      width: 50%;
    }
  }
  .hint{
    height: 30px;
    line-height: 30px;
    color: red;
    font-size: 12px;
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
