<template>
  <el-dialog title="选择人员" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="medium-dialog">
    <el-transfer
      filterable
      ref="myTransfer"
      :filter-method="filterMethod"
      filter-placeholder="请输入人员姓名"
      v-model="checkCrew"
      :props="props"
      :titles="['人员列表', '已选择']"
      :data="crewData">
    </el-transfer>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelClick">取 消</el-button>
      <el-button type="primary" :disabled="disabled" @click="confirmClick">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentIds'],
  data () {
    return {
      crewData: [],
      crewState: false,
      props: {
        label: 'user_name',
        key: 'user_id'
      },
      checkCrew: [],
      filterMethod (query, item) {
        return item.user_name.indexOf(query) > -1
      },
      disabled: true
    }
  },
  computed: {
    ...mapState('other', [
      'projectOrgId'
    ])
  },
  methods: {
    crewInit () {
      this.checkCrew = this.parentIds
      if (!this.crewState) {
        this.getCrewData()
      }
      if (this.$refs.myTransfer) {
        // 清空左边搜索
        this.$refs.myTransfer.$children['0']._data.query = ''
        // 清空右边搜索
        this.$refs.myTransfer.$children['3']._data.query = ''
      }
    },
    // 获取项目人员
    getCrewData () {
      let params = {
        organize_id: this.projectOrgId,
        user_name: '',
        user_phone: '',
        role_id: '',
        page: 1,
        limit1: 10000
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/v3.2/selUser',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          let crewData = res.data.data1.users
          this.crewData = crewData
          this.crewState = true
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
    // 确定
    confirmClick () {
      const crewData = this.crewData
      const checkCrew = this.checkCrew
      let crewArr = []
      checkCrew.forEach(itemValue => {
        let temp = crewData.find((item, index, array) => {
          return itemValue === item.user_id
        })
        if (temp) {
          crewArr.push(temp)
        }
      })
      let crewName = []
      let crewId = []
      crewArr.forEach(item => {
        crewName.push(item.user_name)
        crewId.push(item.user_id)
      })
      crewName = crewName.join('、')
      const obj = {
        names: crewName,
        ids: crewId
      }
      this.$emit('parentUpdata', obj)
    },
    // 取消
    cancelClick () {
      this.$emit('parentCancel')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.crewInit()
      }
    },
    checkCrew (val, oldVal) {
      if (val.length === 0) {
        this.disabled = true
      } else {
        this.disabled = false
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
