<template>
  <div class="plan">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>巡检巡查</el-breadcrumb-item>
          <el-breadcrumb-item>巡检计划管理</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>计划名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>创建人员</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.crew"></el-input>
            </div>
            <div class="item">
              <span>执行部门</span>
              <el-select v-model="nowSearch.sector" style="width: 160px;" clearable filterable placeholder="请选择执行部门">
                <el-option
                  v-for="item in sectorOptions"
                  :key="item.base_id"
                  :label="item.name"
                  :value="item.base_id">
                </el-option>
              </el-select>
            </div>
            <div class="operate"></div>
          </div>
          <div class="search-input">
            <div class="item date">
              <span>执行时段</span>
              <el-date-picker
                style="width: 280px;"
                v-model="nowSearch.date"
                type="daterange"
                value-format="yyyy-MM-dd"
                :clearable="true"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <el-button type="primary" @click="addClick">新增</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column label="计划名称" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="details blue" @click="detClick(scope.row.plan_id)">{{ scope.row.plan_name }}</a>
            </template>
          </el-table-column>
          <el-table-column label="执行部门" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.ogz_id">{{ scope.row.ogz_name }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="执行组">
            <template slot-scope="scope">
              <el-popover
                placement="top"
                :title="scope.row.group_name"
                trigger="click"
                :content="groupContent"
                v-if="scope.row.group_id">
                <a href="javascript:void(0);" slot="reference" class="blue" @click="getGrouoCrew(scope.row.group_id)">{{ scope.row.group_name }}</a>
              </el-popover>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="start_date" label="开始时间"></el-table-column>
          <el-table-column prop="end_date" label="结束时间"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <router-link class="operate com" :to="{ path: '/main/plan-com', query:{id: scope.row.plan_id}}">编辑</router-link>
              <a href="javascript:void(0);" class="operate del" @click="delClick(scope.row.plan_id)">删除</a>
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
    <!-- 详情 -->
    <det-module
      :parentDialog="detDialog"
      :parentPro="projectId"
      :parentId="itemId"
      @parentClose="detClose">
    </det-module>
    <!-- 删除 -->
    <del-module
      :parentDialog="delDialog"
      :parentId="itemId"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/polling/plan-det'
// 引入删除组件
import delModule from '@/components/polling/plan-del'
export default{
  name: 'plan',
  data () {
    return {
      search: {
        name: '',
        crew: '',
        sector: '',
        date: []
      },
      nowSearch: {
        name: '',
        crew: '',
        sector: '',
        date: []
      },
      sectorOptions: [],
      tableData: [],
      groupContent: '',
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      delDialog: false,
      itemId: ''
    }
  },
  created () {
    // 获取列表数据
    this.getListData()
    // 获取部门
    this.getSectorOptions()
  },
  components: {
    detModule,
    delModule
  },
  computed: {
    ...mapState('user', [
      'userId'
    ]),
    ...mapState('other', [
      'companyId',
      'projectId',
      'projectOrgId'
    ])
  },
  methods: {
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
      let date = this.search.date || []
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        projectN_id: this.projectId,
        plan_name: this.search.name,
        createN_user: this.search.crew,
        ogz_id: this.search.sector,
        start_date: date[0] || '',
        end_date: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/inspection/v3.7.3/selInsSearch',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.plans
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
    /* 获取组人员 */
    getGrouoCrew (id) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        group_id: id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.6/selUserByGroupId',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const resData = res.data.data1
          let crewData = []
          resData.forEach(item => {
            crewData.push(item.user_name)
          })
          const groupContent = crewData.join('、')
          this.groupContent = groupContent
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
    addClick () {
      this.$router.push({ path: '/main/plan-add' })
    },
    /* 详情 */
    detClick (id) {
      this.itemId = id
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
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
    /* 部门 */
    getSectorOptions () {
      let params = {
        organize_id: this.projectOrgId
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.2/selOrganizeTree',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.sectorOptions = res.data.data1[0].children
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
    }
  }
}
</script>

<style lang="less" scoped>
.plan{
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
          .date{
            width: 420px;
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
  .large-dialog{
    .el-dialog__body{
      max-height: 480px;
      overflow: auto;
      .content{
        .item{
          font-size: 0;
          margin-bottom: 15px;
          .item-title{
            display: inline-block;
            width: 100px;
            padding-right: 12px;
            text-align: right;
            font-size: 14px;
          }
          p{
            display: inline-block;
            font-size: 14px;
          }
        }
        .task{
          margin-bottom: 15px;
          .task-item{
            margin-bottom: 10px;
            .item-title{
              display: inline-block;
              width: 100px;
              padding-right: 12px;
              line-height: 34px;
              text-align: right;
            }
          }
        }
        .frame{
          margin-bottom: 15px;
          padding-left: 30px;
          .item-title{
            height: 34px;
            line-height: 34px;
          }
          .time{
            font-size: 0;
            .nape{
              display: inline-block;
              width: 200px;
              .nape-title{
                margin-right: 5px;
                line-height: 45px;
                font-size: 14px;
              }
            }
          }
        }
      }
      .el-collapse{
        border: 1px solid #cecece;
        padding: 10px;
        border-radius: 4px;
        .item{
          border-bottom: 1px solid #cecece;
          &:last-of-type{
            border-bottom: none;
          }
          .title{
            height: 30px;
            line-height: 30px;
            color: #272727;
          }
          .norm-hint{
            height: 35px;
            line-height: 34px;
          }
        }
      }
    }
  }
}
</style>
