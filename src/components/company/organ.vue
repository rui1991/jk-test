<template>
  <div class="organ">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>企业配置</el-breadcrumb-item>
          <el-breadcrumb-item>组织管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <div class="tree-top">
            <p class="title">组织机构</p>
            <div class="operate">
              <a href="javascript:;" class="blue" @click="modType = 1" v-show="addShow">新建机构</a>
            </div>
          </div>
          <div style="padding: 5px;">
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
        </el-aside>
        <el-main class="module-main">
          <!-- 编辑企业 -->
          <com-module1
            v-if="modType === 6"
          :parentOrgId = "orgId"
          :parentOrgType = "orgType"
          :parentBaseId = "baseId"
          @parentUpdata="parentRefresh">
          </com-module1>
          <!-- 新增类型 -->
          <type-module
            v-else-if="modType === 1"
            :parentOrgType= "orgType"
            @parentUpType="setAddType">
          </type-module>
          <!-- 新增组织 -->
          <add-module
            v-else-if="modType === 4"
            :parentOrgId = "orgId"
            :parentOrgName = "orgName"
            :parentAddType = "addType"
            @parentUpdata="addUpdata"
            @parentCancel="addCancel">
          </add-module>
          <!-- 编辑组织 -->
          <com-module2
            v-else-if="modType === 5"
            :parentOrgId = "orgId"
            :parentOrgType = "orgType"
            :parentBaseId = "baseId"
            @parentUpdata="parentRefresh">
          </com-module2>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入编辑企业组件
import comModule1 from '@/components/company/organ-com1'
// 引入新增类型组件
import typeModule from '@/components/company/organ-type'
// 引入新增组织组件
import addModule from '@/components/company/organ-add'
// 引入编辑组织组件
import comModule2 from '@/components/company/organ-com2'
export default{
  data () {
    return {
      filterText: '',
      orgData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      orgId: 0,
      orgType: -1,
      orgName: '',
      baseId: 0,
      modType: 0,
      addType: 0,
      addShow: false
    }
  },
  created () {

  },
  mounted () {
    // 获取机构树
    this.getOrganTree()
  },
  components: {
    comModule1,
    typeModule,
    addModule,
    comModule2
  },
  computed: {
    ...mapState('user', [
      'userId'
    ])
  },
  methods: {
    /*
    *  parentModType参数说明：
    *  1: 新增类型
    *  2：新增企业
    *  3：设置（企业、分公司、模块配置）
    *     3-1：设置企业
    *     3-2：设置分公司
    *     3-3：模块配置
    *  4：新增组织（分公司、项目、部门）
    *  5：编辑组织（项目、部门）
    *  6:编辑企业
    * */
    // 获取机构树
    getOrganTree (b = false) {
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
          let orgData = res.data.data1
          if (orgData[0].organize_type === 0) {
            orgData = orgData[0].children
          }
          this.orgData = orgData
          if (b) {
            this.$refs.tree.setCheckedKeys([this.orgId])
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
        if (this.orgId === data.id) return
        this.orgId = data.id
        this.$refs.tree.setCheckedKeys([data.id])
        // 机构类型
        this.orgType = data.organize_type
        // id
        this.orgId = data.id
        // name
        this.orgName = data.name
        // baseId
        this.baseId = data.base_id
      } else {
        if (this.orgId === data.id) {
          this.$refs.tree.setCheckedKeys([data.id])
        }
      }
    },
    /* 新增类型 */
    setAddType (type) {
      this.addType = type
      if (type === 1) {
        this.modType = 2
      } else {
        this.modType = 4
      }
    },
    /* 新增组织 */
    addUpdata () {
      // 刷新树
      this.getOrganTree(true)
      // 设置显示模块
      const type = this.orgType
      if (type === 1) {
        this.modType = 6
      } else {
        this.modType = 5
      }
    },
    addCancel () {
      // 设置显示模块
      const type = this.orgType
      if (type === 1) {
        this.modType = 6
      } else {
        this.modType = 5
      }
    },
    // 刷新树
    parentRefresh () {
      this.getOrganTree(true)
    }
  },
  watch: {
    filterText (val, oldVal) {
      this.$refs.tree.filter(val)
    },
    orgId (val, oldVal) {
      const type = this.orgType
      if (type === 1) {
        this.modType = 6
      } else {
        this.modType = 5
      }
    },
    orgType (val, oldVal) {
      if (val === 4) {
        this.addShow = false
      } else {
        this.addShow = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .organ{
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
