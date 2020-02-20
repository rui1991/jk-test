<template>
  <div class="hardfac">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>设备管理</el-breadcrumb-item>
          <el-breadcrumb-item>硬件设备管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>mac地址</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.mac"></el-input>
            </div>
            <div class="item">
              <span>设备类型</span>
              <el-select v-model="nowSearch.type" clearable style="width: 160px;" placeholder="请选择设备类型">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" @click="addDialog = true">新增</el-button>
            </div>
          </div>
          <div class="search-input">
            <div class="item">
              <span>设备名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>设备状态</span>
              <el-select v-model="nowSearch.state" clearable style="width: 160px;" placeholder="请选择设备状态">
                <el-option
                  v-for="item in stateOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="warnDialog = true">告警推送</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="设备名称" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row)">{{ scope.row.dname }}</a>
            </template>
          </el-table-column>
          <el-table-column label="MAC地址/序列号" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span>{{scope.row.mac | filterMac(scope.row.dtype)}}</span>
            </template>
          </el-table-column>
          <el-table-column label="设备类型">
            <template slot-scope="scope">
              <span v-if="scope.row.dtype === 'dwjz'">定位基站</span>
              <span v-else-if="scope.row.dtype === 'cjk'">采集卡</span>
              <span v-else-if="scope.row.dtype === 'sjwg'">数据网关</span>
              <span v-else-if="scope.row.dtype === 'kqj'">考勤机</span>
            </template>
          </el-table-column>
          <el-table-column label="设备位置">
            <template slot-scope="scope">
              <span v-if="scope.row.location_name">{{ scope.row.location_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="gl" label="是否已关联数据网关"></el-table-column>
          <el-table-column label="设备状态">
            <template slot-scope="scope">
              <span v-if="scope.row.device_state === 0">在线</span>
              <span v-else-if="scope.row.device_state === 1">离线</span>
              <span v-else-if="scope.row.device_state === 2">电量不足</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template slot-scope="scope">
              <!--<a href="javascript:void(0);" class="operate com" @click="relateClick(scope.row.id, scope.row.dtype)" v-if="scope.row.dtype === 'sjwg'">设备关联</a>-->
              <a href="javascript:void(0);" class="operate com" @click="comClick(scope.row)" v-if="scope.row.dtype === 'sjwg' || scope.row.dtype === 'kqj'">编辑</a>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.id, scope.row.dtype)" v-if="scope.row.dtype === 'sjwg' || scope.row.dtype === 'kqj'">删除</a>
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
    <!-- 新增 -->
    <add-module
      :parentDialog="addDialog"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 编辑 -->
    <com-module
      :parentDialog="comDialog"
      :parentForm="itemData"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentForm="itemData"
      @parentClose="detClose">
    </det-module>
    <!-- 删除 -->
    <del-module
      :parentDialog="delDialog"
      :parentId="itemId"
      :parentType="itemType"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
    <!-- 告警推送人 -->
    <warn-module
      :parentDialog="warnDialog"
      :parentForm="itemData"
      @parentClose="warnClose">
    </warn-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/facility/hardfac-add'
// 引入编辑组件
import comModule from '@/components/facility/hardfac-com'
// 引入详情组件
import detModule from '@/components/facility/hardfac-det'
// 引入删除组件
import delModule from '@/components/facility/hardfac-del'
// 引入告警推送人组件
import warnModule from '@/components/facility/hardfac-warn'
export default{
  name: 'hardfac',
  data () {
    return {
      search: {
        mac: '',
        type: '',
        name: '',
        state: ''
      },
      nowSearch: {
        mac: '',
        type: '',
        name: '',
        state: ''
      },
      typeOptions: [
        // {
        //   label: '定位基站',
        //   value: 'dwjz'
        // },
        {
          label: '采集卡',
          value: 'cjk'
        },
        {
          label: '数据网关',
          value: 'sjwg'
        },
        {
          label: '考勤机',
          value: 'kqj'
        }
      ],
      stateOptions: [
        {
          label: '在线',
          value: 0
        },
        {
          label: '离线',
          value: 1
        },
        {
          label: '电量不足',
          value: 2
        }
      ],
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      addDialog: false,
      comDialog: false,
      itemData: {},
      detDialog: false,
      itemId: 0,
      itemType: '',
      delDialog: false,
      warnDialog: false
    }
  },
  created () {
    // 获取列表
    this.getListData()
  },
  components: {
    addModule,
    comModule,
    detModule,
    delModule,
    warnModule
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
    // 搜索
    searchList () {
      let mac = this.nowSearch.mac
      mac = this.formatSetMac(mac)
      this.search = {
        mac: mac,
        type: this.nowSearch.type,
        name: this.nowSearch.name,
        state: this.nowSearch.state
      }
      // 当前页码初始化
      this.nowPage = 1
      // 获取列表数据
      this.getListData()
    },
    // 获取列表数据
    getListData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        mac: this.search.mac,
        dtype: this.search.type,
        dname: this.search.name,
        device_state: this.search.state,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/hardware/v1.0/selHardwareList',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.hardware
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
    // 格式化Mac地址
    formatSetMac (str) {
      let value = str.toLowerCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    },
    /* 新增 */
    addCancel () {
      this.addDialog = false
    },
    addUpdata () {
      this.addDialog = false
      // 获取列表数据
      this.getListData()
    },
    /* 编辑 */
    comClick (data) {
      this.itemData = data
      this.comDialog = true
    },
    comCancel () {
      this.comDialog = false
    },
    comUpdata () {
      this.comDialog = false
      // 获取列表数据
      this.getListData()
    },
    /* 详情 */
    detClick (data) {
      this.itemData = data
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    /* 删除 */
    delClick (id, type) {
      this.itemId = id
      this.itemType = type
      this.delDialog = true
    },
    delCancel () {
      this.delDialog = false
    },
    delUpdata () {
      this.delDialog = false
      // 获取列表数据
      this.getListData()
    },
    /* 告警人 */
    warnClose () {
      this.warnDialog = false
    }
  },
  filters: {
    filterMac (str, type) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      value = value.replace(/:/g, '')
      if (type === 'kqj') { return value }
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    }
  }
}
</script>

<style lang="less" scoped>
.hardfac{
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
    .module-main{
      padding: 10px;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      .search{
        padding: 5px 0;
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
</style>
