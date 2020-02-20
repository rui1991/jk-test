<template>
  <div
    class="crewcollect"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
          <el-breadcrumb-item><router-link to="/main/crewcollect">人员管理汇总</router-link></el-breadcrumb-item>
          <el-breadcrumb-item>{{ moduleTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <el-table class="list-table" :data="tableData" border style="width: 40%; margin-left: auto; margin-right: auto;">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column :prop="value1" :label="lable1"></el-table-column>
          <el-table-column prop="size1" :label="lable2"></el-table-column>
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
  </div>
</template>

<script>
export default{
  name: 'crewcollectDet',
  data () {
    return {
      moduleTitle: '',
      requestUrl: '',
      lable1: '',
      value1: '',
      lable2: '',
      tableData: [],
      total: 0,
      nowPage: 1,
      limit: 10,
      loading: false
    }
  },
  created () {

  },
  mounted () {
    const type = this.$route.query.type
    if (type === 1) {
      this.moduleTitle = '点名成功详情'
      this.requestUrl = '/v3.5/selRcTrueMessage'
      this.lable1 = '姓名'
      this.value1 = 'user_name'
      this.lable2 = '点名次数'
    } else if (type === 2) {
      this.moduleTitle = '点名失败详情'
      this.requestUrl = '/v3.5/selRcFalseMessage'
      this.lable1 = '姓名'
      this.value1 = 'user_name'
      this.lable2 = '点名次数'
    } else if (type === 3) {
      this.moduleTitle = '位置打卡有记录详情'
      this.requestUrl = '/v3.5/selRecordTrueMessage'
      this.lable1 = '地址名称'
      this.value1 = 'position_name'
      this.lable2 = '打卡有记录次数'
    } else if (type === 4) {
      this.moduleTitle = '位置打卡无记录详情'
      this.requestUrl = '/v3.5/selRecordFalseMessage'
      this.lable1 = '地址名称'
      this.value1 = 'position_name'
      this.lable2 = '打卡次数'
    } else if (type === 5) {
      this.moduleTitle = '固定岗位打卡成功详情'
      this.requestUrl = '/v3.5/selPermanentTrueMessage'
      this.lable1 = '岗位名称'
      this.value1 = 'position_name'
      this.lable2 = '打卡次数'
    } else if (type === 6) {
      this.moduleTitle = '固定岗位未打卡详情'
      this.requestUrl = '/v3.5/selPermanentFalseMessage'
      this.lable1 = '岗位名称'
      this.value1 = 'position_name'
      this.lable2 = '未打卡次数'
    }
    // 获取列表
    this.getListData()
  },
  methods: {
    // 获取列表数据
    getListData () {
      let params = {
        project_id: this.$route.query.proId,
        now_date: this.$route.query.date,
        page: this.nowPage,
        limit1: this.limit
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + this.requestUrl,
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          this.total = res.data.data1.total
          this.tableData = res.data.data1.message
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
    }
  }
}
</script>

<style lang="less" scoped>
.crewcollect{
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
    }
  }
}
</style>
