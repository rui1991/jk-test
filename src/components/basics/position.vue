<template>
  <div class="position">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>基础配置</el-breadcrumb-item>
          <el-breadcrumb-item>位置管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <div class="tree-top">
            <p class="title">项目位置</p>
            <div class="operate">
              <a href="javascript:void(0);" class="blue" @click="modType = 2">新建</a>
              <a href="javascript:void(0);" class="blue" @click="modType = 3">批量新建</a>
            </div>
          </div>
          <el-tree
            style="padding: 5px"
            :data="treeData"
            ref="tree"
            show-checkbox
            default-expand-all
            check-strictly
            node-key="id"
            :props="defaultProps"
            @check-change="posCheckChange"
            @node-click="posNodeClick">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <!-- 编辑 -->
          <com-module
            v-show="modType === 1"
            :parentId = "posId"
            @parentUpdata="parentRefresh">
          </com-module>
          <!-- 单个新增 -->
          <add-module1
            v-show="modType === 2"
            :parentId = "posId"
            :parentName = "posName"
            :parentType = "modType"
            @parentUpdata="addUpdata"
            @parentCancel="addCancel">
          </add-module1>
          <!-- 批量新增 -->
          <add-module2
            v-show="modType === 3"
            :parentId = "posId"
            :parentName = "posName"
            :parentType = "modType"
            @parentUpdata="addUpdata"
            @parentCancel="addCancel">
          </add-module2>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入编辑组件
import comModule from '@/components/basics/position-com'
// 引入单个新增组件
import addModule1 from '@/components/basics/position-add1'
// 引入批量新增组件
import addModule2 from '@/components/basics/position-add2'
export default{
  name: 'position',
  data () {
    return {
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      posId: 0,
      posName: '',
      modType: 0
    }
  },
  created () {
    // 获取位置树
    this.getPositionTree()
  },
  mounted () {

  },
  components: {
    comModule,
    addModule1,
    addModule2
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId',
      'projectName'
    ])
  },
  methods: {
    /*
    * modType参数说明
    * 1：详情
    * 2：单个新增
    * 3：批量新增
    * */
    // 获取位置树
    getPositionTree (b = false) {
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
          const treeData = res.data.data1
          this.treeData = [
            {
              'id': 0,
              'name': this.projectName,
              'children': treeData
            }
          ]
          if (b) {
            this.$refs.tree.setCheckedKeys([this.posId])
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
    // 点击位置树
    posCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.posId === data.id) {
          return
        }
        this.$refs.tree.setCheckedKeys([data.id])
        // 存储当前id
        this.posId = data.id
        if (data.id === 0) {
          this.posName = ''
          this.modType = 0
        } else {
          this.posName = data.name
          this.modType = 1
        }
      } else {
        if (this.posId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    posNodeClick (data, node, self) {
      if (node.checked) return
      this.$refs.tree.setCheckedKeys([data.id])
      // 存储当前id
      this.posId = data.id
      if (data.id === 0) {
        this.posName = ''
        this.modType = 0
      } else {
        this.posName = data.name
        this.modType = 1
      }
    },
    /* 新增组织 */
    addUpdata () {
      // 刷新树
      this.getPositionTree(true)
      if (this.posId === 0) {
        this.modType = 0
      } else {
        this.modType = 1
      }
    },
    addCancel () {
      if (this.posId === 0) {
        this.modType = 0
      } else {
        this.modType = 1
      }
    },
    // 刷新树
    parentRefresh () {
      this.getPositionTree(true)
    }
  }
}
</script>

<style lang="less" scoped>
.position{
  height: 100%;
  .module-container{
    height: 100%;
    padding: 0;
    .module-header{
      padding-left: 0;
      padding-right: 0;
      padding-bottom: 20px;
      .el-breadcrumb{
        padding-top: 15px;
        padding-left: 20px;
        padding-bottom: 15px;
        background: #ffffff;
      }
    }
    .module-content{
      height: 100%;
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .module-aside{
        height: 100%;
        border-radius: 6px;
        border: 1px solid #cccccc;
        .tree-top{
          display: table;
          width: 100%;
          height: 40px;
          padding: 0 10px;
          background: #f1f1f1;
          .title{
            display: table-cell;
            vertical-align:middle;
            font-size: 14px;
          }
          .operate{
            display: table-cell;
            vertical-align:middle;
            text-align: right;
            a{
              margin-left: 20px;
            }
          }
        }
      }
      .module-main{
        margin-left: 20px;
        border-radius: 6px;
        border: 1px solid #cccccc;
      }
    }
  }
}
</style>
