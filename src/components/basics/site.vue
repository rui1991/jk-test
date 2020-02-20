<template>
  <div
    class="site"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>基础配置</el-breadcrumb-item>
          <el-breadcrumb-item>地址管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-container class="module-content">
        <el-aside width="280px" class="module-aside">
          <el-tree
            :data="siteTree"
            ref="siteTree"
            show-checkbox
            default-expand-all
            check-strictly
            node-key="id"
            @check-change="siteCheckChange"
            @node-click="siteNodeClick"
            :props="defaultProps">
          </el-tree>
        </el-aside>
        <el-main class="module-main">
          <div class="search">
            <div class="search-input" style="margin-bottom: 10px;">
              <div class="item">
                <span>地址名称</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
              </div>
              <div class="item">
                <span>地址标签</span>
                <el-input style="width: 160px;" v-model.trim="nowSearch.mac"></el-input>
              </div>
              <div class="operate">
                <el-button type="danger" :disabled="handleDisabled" @click="delDialog = true">删除</el-button>
                <el-button type="primary" @click="searchList">搜索</el-button>
                <el-button type="primary" :disabled="addDisabled" @click="addDialog = true">新增</el-button>
              </div>
            </div>
            <div class="search-input">
              <div class="item">
                <span>地址类型</span>
                <el-select v-model="nowSearch.type" style="width: 160px;" clearable placeholder="请选择地址类型">
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div class="operate">
                <el-button type="primary" :disabled="qrDisabled" @click="qrDialog = true">生成二维码</el-button>
                <el-button type="primary" @click="upClick">导入</el-button>
                <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              </div>
            </div>
          </div>
          <el-table class="list-table" :data="tableData" @selection-change="handleSelectionChange" border style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="index" width="50" label="序号"></el-table-column>
            <el-table-column prop="position_id" label="地址编号"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" label="地址名称">
              <template slot-scope="scope">
                <a href="javascript:void(0);" class="name" @click="detClick(scope.row.position_id)">{{ scope.row.position_name }}</a>
              </template>
            </el-table-column>
            <el-table-column label="地址标签">
              <template slot-scope="scope">
                <span>{{ scope.row.position_mac | formatMac }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="node_btpw" :formatter="eleFormatter" label="设备电量"></el-table-column>
            <el-table-column prop="area_type" :formatter="areaFormatter" label="区域类型"></el-table-column>
            <el-table-column prop="parent_address" label="上级位置"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row.position_id)">编辑</a>
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
      :parentId="siteId"
      :parentName="siteName"
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
      :parentId="itemId"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
    <!-- 删除 -->
    <del-module
      :parentDialog="delDialog"
      :parentData="multipleSelection"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
    <!-- 导入 -->
    <up-module
      :parentDialog="upDialog"
      @parentUpdata="upUpdata"
      @parentClose="upClose">
    </up-module>
    <!-- 二维码 -->
    <qr-module
      v-show="false"
      :parentDialog="qrDialog"
      :parentData="multipleSelection"
      @parentFinish="qrFinish">
    </qr-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/basics/site-add'
// 引入详情组件
import detModule from '@/components/basics/site-det'
// 引入编辑组件
import comModule from '@/components/basics/site-com'
// 引入删除组件
import delModule from '@/components/basics/site-del'
// 引入上传组件
import upModule from '@/components/basics/site-up'
// 引入二维码组件
import qrModule from '@/components/basics/site-qr'
export default{
  name: 'site',
  data () {
    return {
      search: {
        name: '',
        mac: '',
        type: ''
      },
      nowSearch: {
        name: '',
        mac: '',
        type: ''
      },
      typeOptions: [
        {
          label: '巡检地址',
          value: 0
        },
        {
          label: '固定岗位',
          value: 6
        }
      ],
      siteTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      siteName: '',
      siteId: '',
      state: false,
      depth: 0,
      tableData: [],
      multipleSelection: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDisabled: true,
      addDialog: false,
      detDialog: false,
      comDialog: false,
      delDialog: false,
      handleDisabled: true,
      itemId: '',
      upDialog: false,
      downDisabled: false,
      qrDialog: false,
      qrDisabled: true,
      loading: false
    }
  },
  created () {
    // 获取地址树
    this.getSiteTree()
  },
  components: {
    addModule,
    detModule,
    comModule,
    delModule,
    upModule,
    qrModule
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
    // 获取地址树
    getSiteTree (b = false) {
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
          const treeData = res.data.data1
          this.siteTree = [
            {
              id: '0',
              name: this.projectName,
              children: treeData
            }
          ]
          // this.siteTree = treeData
          if (b) {
            this.$refs.siteTree.setCheckedKeys([this.siteId])
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
    // 点击地址树
    siteCheckChange (data, checked, self) {
      if (checked === true) {
        if (this.siteId === data.id) {
          return
        }
        this.$refs.siteTree.setCheckedKeys([data.id])
        // 设置当前id和name
        this.siteId = data.id
        this.siteName = data.name
        // 清空搜索框
        this.search = {
          name: '',
          mac: '',
          type: ''
        }
        this.nowSearch = {
          name: '',
          coding: '',
          type: ''
        }
        // 当前页码初始化
        this.nowPage = 1
        // 获取列表数据
        this.getListData()
      } else {
        if (this.siteId === data.id) {
          this.$refs.siteTree.setCheckedKeys([data.id])
        }
      }
    },
    siteNodeClick (data, node, self) {
      if (node.checked) return
      this.$refs.siteTree.setCheckedKeys([data.id])
      // 设置当前id和name
      this.siteId = data.id
      this.siteName = data.name
      // 清空搜索框
      this.search = {
        name: '',
        mac: '',
        type: ''
      }
      this.nowSearch = {
        name: '',
        coding: '',
        type: ''
      }
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 搜索
    searchList () {
      this.search = JSON.parse(JSON.stringify(this.nowSearch))
      // 格式化mac
      let mac = this.search.mac
      this.search.mac = this.formatSetMac(mac)
      // 清空选中数据
      // name
      this.siteName = ''
      // id
      this.siteId = '0'
      // 清空选中项
      this.$refs.siteTree.setCheckedKeys(['0'])
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 格式化设置Mac地址
    formatSetMac (str) {
      if (!str) { return '' }
      const mac = str.replace(/:/g, '')
      let value = mac.toLowerCase()
      return value
    },
    // 获取列表数据
    getListData () {
      if (!this.siteId) return
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_id: this.siteId.replace(/w/g, ''),
        position_type: this.search.type,
        s_po_name: this.search.name,
        s_po_mark: this.search.mac,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/selPositionChild',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.ogz
          // 清空选中项
          this.multipleSelection = []
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
        this.loading = false
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    // 筛选设备电量
    eleFormatter (row, column, cellValue, index) {
      if (cellValue === undefined) {
        return '-'
      } else {
        return cellValue + '%'
      }
    },
    // 筛选区域类型
    areaFormatter (row, column, cellValue, index) {
      let areaType = ''
      switch (cellValue) {
        case 0:
          areaType = '楼栋'
          break
        case 1:
          areaType = '单元'
          break
        case 2:
          areaType = '楼层'
          break
        case 3:
          areaType = '办公区域'
          break
        case 4:
          areaType = '商铺'
          break
        case 5:
          areaType = '卫生间'
          break
        case 6:
          areaType = '停车场'
          break
        case 7:
          areaType = '公共区域'
          break
        case 8:
          areaType = '外围'
          break
        case 9:
          areaType = '岗亭'
          break
        default:
          areaType = ''
      }
      return areaType
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
    // 获取列表选中项
    handleSelectionChange (data) {
      this.multipleSelection = data
    },
    /* 新增 */
    addUpdata () {
      this.addDialog = false
      // 刷新地址树
      this.getSiteTree(true)
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
      // 刷新地址树
      this.getSiteTree(true)
      // 更新列表
      this.getListData()
    },
    comCancel () {
      this.comDialog = false
    },
    /* 删除 */
    delUpdata () {
      this.delDialog = false
      // 刷新地址树
      this.getSiteTree(true)
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
      // 刷新地址树
      this.getSiteTree(true)
      // 更新列表
      this.getListData()
    },
    upClose () {
      this.upDialog = false
    },
    // 导出文件
    downFile () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        depth: 1
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/positionEO?' + params
    },
    /* 生成二维码 */
    qrFinish () {
      this.qrDialog = false
    }
  },
  watch: {
    siteId (newVal, oldVal) {
      if (newVal.indexOf('w') !== -1) {
        this.addDisabled = false
      } else {
        this.addDisabled = true
      }
    },
    multipleSelection (newVal, oldVal) {
      if (newVal.length > 0) {
        this.handleDisabled = false
        this.qrDisabled = false
      } else {
        this.handleDisabled = true
        this.qrDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.site{
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
  .mult-dialog{
    .el-dialog__header{
      display: none;
    }
  }
}
</style>
