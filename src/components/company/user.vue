<template>
  <div class="user">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>企业配置</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <el-tree
            :data="orgTree"
            :highlight-current="true"
            default-expand-all
            node-key="id"
            :props="defaultProps"
            @node-click="handleNodeClick">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item">
                <span>搜索用户</span>
                <el-input style="width: 200px;" placeholder="请输入姓名或MAC" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" @click="searchList">搜索</el-button>
                <el-button type="primary" @click="addDialog = true">新增</el-button>
              </div>
            </div>
            <div class="search-input">
              <div class="item">
                <span>联系电话</span>
                <el-input style="width: 200px;" v-model.trim="nowSearch.phone"></el-input>
              </div>
              <div class="operate">
                <el-button type="primary" :disabled="upDisabled" @click="upClick">导入</el-button>
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" border style="width: 100%">
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column prop="user_id" label="用户ID"></el-table-column>
            <el-table-column label="用户姓名">
              <template slot-scope="scope">
                <a href="javascript:void(0);" class="name" @click="detClick(scope.row.user_id)">{{ scope.row.user_name }}</a>
              </template>
            </el-table-column>
            <el-table-column prop="user_phone" label="联系电话"></el-table-column>
            <el-table-column prop="role_name" label="角色"></el-table-column>
            <el-table-column prop="ogz_name" label="所属部门"></el-table-column>
            <el-table-column label="卡片mac地址" width="230">
              <template slot-scope="scope">
                <span>{{ scope.row.card_mac | filterMac }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="178">
              <template slot-scope="scope">
                <a href="javascript:void(0);" class="operate com" @click="bindClick(scope.row.user_id, scope.row.project_id)" v-if="scope.row.project_id && !scope.row.card_mac">绑卡</a>
                <a href="javascript:void(0);" class="operate del" @click="untieClick(scope.row.user_id, scope.row.project_id, scope.row.card_mac)" v-if="scope.row.project_id && scope.row.card_mac">解绑</a>
                <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.user_id)" v-if="authority.com">编辑</a>
                <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.user_id)" v-if="authority.del">删除</a>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            prev-text="上一页"
            next-text="下一页"
            :current-page="nowPage"
            layout="sizes, prev, pager, next, total"
            :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
            :page-size="limit"
            @size-change="handleSizeChange"
            @current-change="pageChang"
            :total="total">
          </el-pagination>
        </el-main>
      </el-container>
    </el-container>
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      :parentRoles="roleOptions"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
    <!-- 编辑 -->
    <com-module
      :parentDialog="comDialog"
      :parentRoles="roleOptions"
      :parentId="itemId"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
    <!-- 绑卡 -->
    <bind-module
      :parentDialog="bindDialog"
      :parentId="itemId"
      :parentComId="companyId"
      :parentPro="proId"
      @parentUpdata="bindUpdata"
      @parentCancel="bindCancel">
    </bind-module>
    <!-- 解绑 -->
    <untie-module
      :parentDialog="untieDialog"
      :parentId="itemId"
      :parentComId="companyId"
      :parentPro="proId"
      :parentMac="cardMac"
      @parentUpdata="untieUpdata"
      @parentCancel="untieCancel">
    </untie-module>
    <!-- 删除 -->
    <del-module
      :parentDialog="delDialog"
      :parentId="itemId"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
    <!-- 导入 -->
    <up-module
      :parentDialog="upDialog"
      :parentOrgId="orgId"
      :parentOrgName="orgName"
      :parentOrgType="orgType"
      :parentOrgBase="orgBase"
      @parentUpdata="upUpdata"
      @parentClose="upClose">
    </up-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/company/user-add'
// 引入详情组件
import detModule from '@/components/company/user-det'
// 引入编辑组件
import comModule from '@/components/company/user-com'
// 引入绑卡组件
import bindModule from '@/components/company/user-bind'
// 引入解绑组件
import untieModule from '@/components/company/user-untie'
// 引入删除组件
import delModule from '@/components/company/user-del'
// 引入导入组件
import upModule from '@/components/company/user-up'
export default{
  name: 'cuser',
  data () {
    return {
      authority: {
        add: true,
        com: true,
        del: true
      },
      search: {
        name: '',
        phone: '',
        role: ''
      },
      nowSearch: {
        name: '',
        phone: '',
        role: ''
      },
      orgId: 0,
      orgName: '',
      orgType: '',
      orgBase: '',
      roleOptions: [],
      orgTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      itemId: 0,
      proId: 0,
      cardMac: '',
      addDialog: false,
      detDialog: false,
      comDialog: false,
      bindDialog: false,
      untieDialog: false,
      delDialog: false,
      upDialog: false,
      upDisabled: true,
      downDisabled: true
    }
  },
  created () {
    // 获取组织树
    this.getOrganTree()
    // 获取角色
    this.getRoleOptions()
    // 权限
    let autDet = this.autDet
    autDet.indexOf(15) === -1 ? this.authority.add = false : this.authority.add = true
    autDet.indexOf(16) === -1 ? this.authority.com = false : this.authority.com = true
    autDet.indexOf(17) === -1 ? this.authority.del = false : this.authority.del = true
  },
  components: {
    addModule,
    detModule,
    comModule,
    bindModule,
    untieModule,
    delModule,
    upModule
  },
  computed: {
    ...mapState('user', [
      'companyId',
      'userId'
    ]),
    ...mapState('user', {
      autDet: state => state.autDet.user
    })
  },
  methods: {
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
          let orgTree = res.data.data1
          if (orgTree[0].organize_type === 0) {
            orgTree = orgTree[0].children
          }
          this.orgTree = orgTree
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
    // 点击组织树
    handleNodeClick (data) {
      // 设置当前id
      this.orgId = data.id
      this.orgName = data.name
      this.orgType = data.organize_type
      this.orgBase = data.base_id
      // 清空搜索框
      this.search = {
        name: '',
        phone: '',
        role: ''
      }
      this.nowSearch = {
        name: '',
        phone: '',
        role: ''
      }
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      if (!this.orgId) return
      let name = this.search.name
      name = name.replace(/:/g, '')
      let params = {
        organize_id: this.orgId,
        user_name: name,
        user_phone: this.search.phone,
        role_id: this.search.role,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.users
          // 检验是否列表为空
          if (this.tableData.length === 0 && this.nowPage > 1) {
            this.nowPage--
            this.getListData()
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
    // 切换单页大小
    handleSizeChange (limit) {
      // 设置大小
      this.limit = limit
      // 初始化页码
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 点击分页
    pageChang (page) {
      this.nowPage = page
      // 获取列表数据
      this.getListData()
    },
    /* 选择角色 */
    getRoleOptions () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        s_role_name: '',
        s_role_mark: ''
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.2/selRole',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const roleData = res.data.data1
          this.roleOptions = roleData
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
    /* 新增 */
    addUpdata () {
      this.addDialog = false
      // 更新列表
      this.getListData()
    },
    addCancel () {
      this.addDialog = false
    },
    /* 详情 */
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 编辑 */
    comClick (id) {
      this.itemId = id
      this.comDialog = true
    },
    comUpdata () {
      this.comDialog = false
      // 更新列表
      this.getListData()
    },
    comCancel () {
      this.comDialog = false
    },
    /* 绑卡 */
    bindClick (id, proid) {
      this.itemId = id
      this.proId = proid
      this.bindDialog = true
    },
    bindUpdata () {
      this.bindDialog = false
      // 更新列表
      this.getListData()
    },
    bindCancel () {
      this.bindDialog = false
    },
    /* 解绑 */
    untieClick (id, proid, mac) {
      this.itemId = id
      this.proId = proid
      this.cardMac = mac
      this.untieDialog = true
    },
    untieUpdata () {
      this.untieDialog = false
      // 更新列表
      this.getListData()
    },
    untieCancel () {
      this.untieDialog = false
    },
    /* 删除 */
    delClick (id) {
      this.itemId = id
      this.delDialog = true
    },
    delUpdata () {
      this.delDialog = false
      // 更新列表
      this.getListData()
    },
    delCancel () {
      this.delDialog = false
    },
    /* 导入 */
    upClick () {
      this.upDialog = true
    },
    upUpdata () {
      this.upDialog = false
      // 更新列表
      this.getListData()
    },
    upClose () {
      this.upDialog = false
    },
    /* 导出 */
    downFile () {
      let params = {
        user_id: this.userId,
        organize_id: this.orgId,
        user_name: this.search.name,
        user_phone: this.search.phone,
        role_id: this.search.role
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = '/ezx_jk/v3.2/userEO?' + params
    }
  },
  filters: {
    filterMac (str) {
      if (!str) { return '-' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    }
  },
  watch: {
    orgId (val, oldVal) {
      if (val) {
        this.upDisabled = false
        this.downDisabled = false
      } else {
        this.upDisabled = true
        this.downDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .user{
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
        padding-top: 10px;
        padding-right: 0;
        padding-bottom: 10px;
        padding-left: 10px;
        margin-left: 20px;
        margin-right: 20px;
        background: #ffffff;
        .module-aside{
          height: 100%;
          padding: 5px;
          border-radius: 6px;
          border: 1px solid #cccccc;
        }
        .module-main{
          padding-top: 0;
          padding-right: 10px;
          padding-bottom: 0;
          padding-left: 20px;
          overflow: scroll;
          .search{
            padding-top: 5px;
            padding-bottom: 5px;
            .search-input{
              display: table;
              width: 100%;
              .item{
                display: table-cell;
                vertical-align: middle;
                width: 280px;
                font-size: 0;
                span{
                  width: 70px;
                  display: inline-block;
                  line-height: 34px;
                  font-size: 14px;
                }
              }
              .operate{
                display: table-cell;
                vertical-align: middle;
                text-align: right;
              }
            }
          }
        }
      }
    }
  }
</style>
