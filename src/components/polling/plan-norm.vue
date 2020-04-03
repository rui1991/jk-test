<template>
  <div class="plan-norm">
    <div class="site-item" v-for="item in siteData" :key="item.position_id">
      <h3 class="site-name">{{item.position_name}}</h3>
      <div class="norm" v-if="item.template_id === 0">
        <div class="norm-top">
          <div class="norm-title red">未关联巡检标准</div>
          <div class="norm-operate">
            <el-button type="primary" @click="addClick(item.position_id)">关联</el-button>
          </div>
        </div>
      </div>
      <div class="norm" v-else>
        <div class="norm-top">
          <div class="norm-title">{{item.template_name}}</div>
          <div class="norm-operate">
            <i class="el-icon-edit blue" @click="comClick(item.template_id)"></i>
            <i class="el-icon-delete red" @click="delClick(item.position_id)"></i>
          </div>
        </div>
        <el-table class="list-table" :data="item.template.inss" border style="width: 100%; margin-top: 0;">
          <el-table-column prop="ins_name" label="检查项" width="80"></el-table-column>
          <el-table-column prop="ins_method" label="检查方法" class-name="multi-row"></el-table-column>
          <el-table-column prop="check_content" label="检查内容及要求" class-name="multi-row"></el-table-column>
          <el-table-column prop="alarm_level" label="报警等级" width="80"></el-table-column>
        </el-table>
      </div>
    </div>
    <div class="operate">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" @click="skipClick(1)">上一步</el-button>
      <el-button type="primary" @click="skipClick(3)">下一步</el-button>
    </div>
    <!-- 关联 -->
    <add-module
      :parentDialog="addDialog"
      :parentId="siteId"
      @parentUpdata="addUpdata"
      @parentCancel="addCancel">
    </add-module>
    <!-- 编辑 -->
    <com-module
      :parentDialog="comDialog"
      :parentId="temId"
      @parentUpdata="comUpdata"
      @parentCancel="comCancel">
    </com-module>
    <!-- 解除关联 -->
    <del-module
      :parentDialog="delDialog"
      :parentId="siteId"
      @parentUpdata="delUpdata"
      @parentCancel="delCancel">
    </del-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入新增组件
import addModule from '@/components/polling/site-norm1'
// 引入编辑组件
import comModule from '@/components/polling/norm-com'
// 引入解除组件
import delModule from '@/components/polling/site-norm2'
export default{
  props: ['parentSite'],
  data () {
    return {
      siteData: [],
      siteId: '',
      temId: '',
      addDialog: false,
      comDialog: false,
      delDialog: false
    }
  },
  created () {
    // 获取地址数据
    this.getListData()
  },
  components: {
    addModule,
    comModule,
    delModule
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
    getListData () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        position_ids: this.parentSite.positions.join(',')
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/inspection/selInsSetPositionsTemplate',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          this.siteData = res.data.data1
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
    /* 关联 */
    addClick (id) {
      this.siteId = id
      this.addDialog = true
    },
    addUpdata () {
      this.addDialog = false
      // 刷新地址数据
      this.getListData()
    },
    addCancel () {
      this.addDialog = false
    },
    /* 编辑 */
    comClick (id) {
      this.temId = id
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
    /* 删除 */
    delClick (id) {
      this.siteId = id
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
    // 跳转
    skipClick (num) {
      this.$emit('parentActiveFun', num)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancelFun')
    }
  }
}
</script>

<style lang="less" scoped>
.plan-norm{
  width: 80%;
  padding: 20px;
  margin: 0 auto;
  background: #ffffff;
  .site-item{
    .site-name{
      height: 35px;
      line-height: 35px;
    }
    .norm{
      margin-bottom: 20px;
      .norm-top{
        display: table;
        width: 100%;
        height: 45px;
        .norm-title{
          display: table-cell;
          vertical-align:middle;
        }
        .norm-operate{
          display: table-cell;
          vertical-align:middle;
          text-align: right;
          i{
            margin: 0 3px;
            font-size: 18px;
            cursor: pointer;
          }
        }
      }
    }
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
