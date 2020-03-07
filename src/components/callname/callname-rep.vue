<template>
  <div
    class="callname-rep"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>点名管理</el-breadcrumb-item>
          <el-breadcrumb-item>点名报表</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="search">
          <div class="search-input" style="margin-bottom: 10px;">
            <div class="item">
              <span>人员名称</span>
              <el-input style="width: 160px;" v-model.trim="nowSearch.name"></el-input>
            </div>
            <div class="item">
              <span>点名结果</span>
              <el-select v-model="nowSearch.result" clearable style="width: 160px;" placeholder="请选择点名结果">
                <el-option
                  v-for="item in resultOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="operate">
              <el-button type="primary" @click="searchList">搜索</el-button>
              <!--<el-button type="primary" @click="setClick">设置</el-button>-->
            </div>
          </div>
          <div class="search-input">
            <div class="item date">
              <span>选择时段</span>
              <el-date-picker
                style="width: 280px;"
                v-model="nowSearch.date"
                type="daterange"
                value-format="yyyy-MM-dd"
                :clearable="false"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </div>
            <div class="operate">
              <el-button type="primary" :disabled="downDisabled" @click="downFile">导出</el-button>
              <el-button type="primary" :disabled="downAllDisabled" @click="downAllFile">导出汇总</el-button>
            </div>
          </div>
        </div>
        <el-table class="list-table" :data="tableData" border style="width: 100%">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="user_name" width="150" label="姓名" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="adate" width="180" label="日期"></el-table-column>
          <el-table-column :show-overflow-tooltip="true" label="点名地址">
            <template slot-scope="scope">
              <span v-if="scope.row.positions">{{ scope.row.positions }}</span>
              <span v-else>全部</span>
            </template>
          </el-table-column>
          <el-table-column width="150" label="点名次数">
            <template slot-scope="scope">
              <a href="javascript:void(0);" class="name" @click="detClick(scope.row)">{{ scope.row.sf }}</a>
            </template>
          </el-table-column>
          <el-table-column width="150" label="点名结果">
            <template slot-scope="scope">
              <span v-if="scope.row.over === 1">成功</span>
              <span class="red" v-else-if="scope.row.over === 0">失败</span>
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
      :parentUid="uid"
      :parentDate="itemDate"
      @parentClose="detClose">
    </det-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入详情组件
import detModule from '@/components/callname/callname-det'
export default{
  name: 'callnameRep',
  data () {
    return {
      search: {
        name: '',
        result: '',
        date: []
      },
      nowSearch: {
        name: '',
        result: '',
        date: []
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now() - 8.64e7
        }
      },
      resultOptions: [
        {
          label: '成功',
          value: 1
        },
        {
          label: '失败',
          value: 0
        }
      ],
      tableData: [],
      loading: false,
      total: 0,
      nowPage: 1,
      limit: 10,
      detDialog: false,
      uid: 0,
      itemDate: '',
      downDisabled: false,
      downAllDisabled: false
    }
  },
  created () {

  },
  mounted () {
    const nowDate = this.$common.getBeforeDate()
    this.search.date = [nowDate, nowDate]
    this.nowSearch.date = [nowDate, nowDate]
    // 获取列表数据
    this.getListData()
  },
  components: {
    detModule
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
      let date = this.search.date || []
      const startDate = date[0] || ''
      const endDate = date[1] || ''
      const fate = this.getDateDiff(startDate, endDate)
      if (fate) {
        this.$message({
          showClose: true,
          message: '查询时长不能超过31天',
          type: 'warning'
        })
        return
      }
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
        project_id: this.projectId,
        user_name: this.search.name,
        over: this.search.result,
        start_date: date[0] || '',
        end_date: date[1] || '',
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v2.0/selRollCallResult',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.rcs
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
    /* 详情 */
    detClick (data) {
      this.uid = data.user_id
      this.itemDate = data.adate
      this.detDialog = true
    },
    detClose () {
      this.detDialog = false
    },
    // 获取跨越天数
    getDateDiff (startDate, endDate) {
      let startTime = new Date(Date.parse(startDate.replace(/-/g, '/'))).getTime()
      let endTime = new Date(Date.parse(endDate.replace(/-/g, '/'))).getTime()
      const seaDuration = endTime - startTime
      const maxDuration = 1000 * 60 * 60 * 24 * 31
      if (seaDuration > maxDuration) {
        return true
      } else {
        return false
      }
    },
    /* 导出 */
    downFile () {
      let date = this.search.date || []
      let params = {
        company_id: this.companyId,
        project_id: this.projectId,
        user_name: this.search.name,
        over: this.search.result,
        start_date: date[0] || '',
        end_date: date[1] || ''
      }
      params = this.$qs.stringify(params)
      this.downDisabled = true
      setTimeout(() => {
        this.downDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v2.0/rollCallResultEO?' + params
    },
    downAllFile () {
      let date = this.search.date || []
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        user_name: this.search.name,
        over: this.search.result,
        start_date: date[0] || '',
        end_date: date[1] || ''
      }
      params = this.$qs.stringify(params)
      this.downAllDisabled = true
      setTimeout(() => {
        this.downAllDisabled = false
      }, 5000)
      window.location.href = this.sysetApi() + '/v2.0/selRollCallReportSummaryEO?' + params
    },
    /* 点名次数 */
    /* 设置 */
    setClick () {
      this.$router.push({ path: '/main/callname-set' })
    }
  }
}
</script>

<style lang="less" scoped>
.callname-rep{
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
}
</style>
