<template>
  <el-dialog title="设备详情" :visible.sync="parentDialog" :show-close="false" :close-on-click-modal="false" custom-class="large-dialog mult-dialog">
    <el-tabs v-model="detActive" type="card" @tab-click="detTabClick">
      <el-tab-pane label="设备详情" name="facility"></el-tab-pane>
      <el-tab-pane label="设备电量详情" :disabled ="tabDisabled" name="electric"></el-tab-pane>
      <el-tab-pane label="设备履历详情" :disabled ="tabDisabled" name="record"></el-tab-pane>
    </el-tabs>
    <el-form :model="detForm" :label-width="formLabelWidth" v-show="detActive === 'facility'">
      <div class="two-form">
        <el-form-item class="item" label="设备名称">
          <el-input :disabled="true" v-model="detForm.name"></el-input>
        </el-form-item>
        <el-form-item class="item" label="设备类型">
          <el-input :disabled="true" v-model="detForm.type"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" :label="codingName">
          <el-input :disabled="true" v-model="detForm.coding"></el-input>
        </el-form-item>
        <el-form-item class="item" label="设备位置">
          <el-input :disabled="true" v-model="detForm.posName"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="设备状态">
          <el-input :disabled="true" v-model="detForm.state"></el-input>
        </el-form-item>
      </div>
      <el-table class="select-table" :data="detForm.relateTable" v-show="detForm.relateTable.length > 0">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column label="设备MAC地址" width="180">
          <template slot-scope="scope">
            <span v-if="scope.row.gw_type === 'sjwg'">{{ scope.row.gw_mac }}</span>
            <span v-else-if="scope.row.card_type === 'cjk'">{{ scope.row.card_mac }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备类型" width="80">
          <template slot-scope="scope">
            <span v-if="scope.row.gw_type === 'sjwg'">数据网关</span>
            <span v-else-if="scope.row.card_type === 'cjk'">采集卡</span>
          </template>
        </el-table-column>
        <el-table-column label="设备名称">
          <template slot-scope="scope">
            <span v-if="scope.row.gw_type === 'sjwg'">{{ scope.row.gw_name }}</span>
            <span v-else-if="scope.row.card_type === 'cjk'">{{ scope.row.card_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="绑定状态">
          <template slot-scope="scope">
            <span v-if="scope.row.register_state === 0">已绑定</span>
            <span v-else-if="scope.row.register_state === 1">未绑定</span>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <el-form :model="detEleForm" :label-width="formLabelWidth" v-show="detActive === 'electric'">
      <div class="two-form">
        <el-form-item class="item" label="设备名称">
          <el-input :disabled="true" v-model="detEleForm.name"></el-input>
        </el-form-item>
        <el-form-item class="item" label="设备mac">
          <el-input :disabled="true" v-model="detEleForm.mac"></el-input>
        </el-form-item>
      </div>
      <div class="two-form">
        <el-form-item class="item" label="当前电量">
          <el-input :disabled="true" v-model="detEleForm.quantity"></el-input>
        </el-form-item>
        <el-form-item class="item" label="设备状态">
          <el-input :disabled="true" v-model="detEleForm.state"></el-input>
        </el-form-item>
      </div>
      <!--<div class="two-form">-->
        <!--<el-form-item class="item" label="充电频次">-->
          <!--<el-input :disabled="true" v-model="detEleForm.frequency"></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item class="item" label="可用时长">-->
          <!--<el-input :disabled="true" v-model="detEleForm.usable"></el-input>-->
        <!--</el-form-item>-->
      <!--</div>-->
    </el-form>
    <el-form :model="detRecForm" :label-width="formLabelWidth" v-show="detActive === 'record'">
      <div class="two-form">
        <el-form-item class="item" label="注册时间">
          <el-input :disabled="true" v-model="detRecForm.time"></el-input>
        </el-form-item>
        <el-form-item class="item" label="使用公司">
          <el-input :disabled="true" v-model="detRecForm.firm"></el-input>
        </el-form-item>
      </div>
      <div class="two-form" v-for="item in detRecForm.list" :key="item.time">
        <el-form-item class="item" label="升级时间">
          <el-input :disabled="true" v-model="item.create_time"></el-input>
        </el-form-item>
        <el-form-item class="item" label="版本号">
          <el-input :disabled="true" v-model="item.version"></el-input>
        </el-form-item>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClick">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default{
  props: ['parentDialog', 'parentForm'],
  data () {
    return {
      formLabelWidth: '100px',
      codingName: '设备mac',
      detForm: {
        name: '',
        type: '',
        coding: '',
        posName: '',
        state: '',
        relateTable: []
      },
      tabDisabled: false,
      detActive: 'facility',
      detEleState: false,
      detEleForm: {
        name: '',
        mac: '',
        quantity: '',
        state: ''
        // frequency: '',
        // usable: ''
      },
      detRecState: false,
      detRecForm: {
        time: '',
        firm: '',
        list: []
      }
    }
  },
  created () {

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
    // 初始化数据
    detInit () {
      // 默认查看设备详情
      this.detActive = 'facility'
      this.detEleState = false
      this.detRecState = false
      // 考勤机详情
      if (this.parentForm.dtype === 'kqj') {
        this.codingName = '序列号'
        // 编码
        let coding = this.parentForm.mac
        coding = this.formatSetSerial(coding)
        // 设备状态
        const stateValue = this.parentForm.device_state
        let state = ''
        if (stateValue === 0) {
          state = '在线'
        } else if (stateValue === 1) {
          state = '离线'
        } else if (stateValue === 2) {
          state = '电量不足'
        }
        this.detForm = {
          name: this.parentForm.dname,
          type: '考勤机',
          coding: coding,
          posName: '',
          state: state,
          relateTable: []
        }
        return
      }
      // 非考勤机
      this.codingName = '设备mac'
      this.detForm = {
        name: '',
        type: '',
        coding: '',
        posName: '',
        state: '',
        relateTable: []
      }
      this.getDetItem()
    },
    getDetItem () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        device_id: this.parentForm.id,
        dtype: this.parentForm.dtype
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/hardware/v1.0/selHardwareOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1
          // 设备类型
          const typeValue = itemData.device_type
          let type = ''
          if (typeValue === 'dwjz') {
            type = '定位基站'
          } else if (typeValue === 'cjk') {
            type = '采集卡'
          } else if (typeValue === 'sjwg') {
            type = '数据网关'
          } else if (typeValue === 'kqj') {
            type = '考勤机'
          }
          // 设备状态
          const stateValue = itemData.device_state
          let state = ''
          if (stateValue === 0) {
            state = '在线'
          } else if (stateValue === 1) {
            state = '离线'
          } else if (stateValue === 2) {
            state = '电量不足'
          }
          // 编码
          let coding = itemData.device_mac
          coding = this.formatSetMac(coding)
          this.detForm = {
            name: itemData.device_name,
            type: type,
            coding: coding,
            posName: itemData.location_name || '',
            state: state,
            relateTable: itemData.relation || []
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
    // 详情导航
    detTabClick (tab) {
      if (tab.name === 'facility') return
      if (tab.name === 'electric' && !this.detEleState) {
        // 清空数据
        this.detEleForm = {
          name: '',
          mac: '',
          quantity: '',
          state: ''
          // frequency: '',
          // usable: ''
        }
        this.checkEleDetails()
      } else if (tab.name === 'record' && !this.detRecState) {
        this.detRecForm = {
          time: '',
          firm: '',
          list: []
        }
        this.checkRecDetails()
      }
    },
    /* 电量详情 */
    checkEleDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        device_id: this.parentForm.id
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/hardware/v1.0/selHardwarePwOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 电量详情状态
          this.detEleState = true
          const itemData = res.data.data1
          // 当前电量
          let quantity = itemData.card_pw || ''
          if (quantity) {
            quantity = quantity + '%'
          }
          // 充电频次
          // let frequency = itemData.frequency || ''
          // if (frequency) {
          //   frequency = '1周' + frequency + '次'
          // }
          // 可用时长
          // const usable = this.timeStamp(itemData.ctime)
          this.detEleForm = {
            name: itemData.card_name || '',
            mac: itemData.card_mac || '',
            quantity: quantity,
            state: itemData.lineState || ''
            // frequency: frequency,
            // usable: usable
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
    timeStamp (num) {
      if (!num) { return '' }
      let day = Number.parseInt(num / 60 / 24)
      var hour = Number.parseInt(num / 60 % 24)
      var min = Number.parseInt(num % 60)
      let time = ''
      if (day > 0) {
        time = day + '天'
      }
      if (hour > 0) {
        time += hour + '小时'
      }
      if (min > 0) {
        time += parseFloat(min) + '分钟'
      }
      return time
    },
    /* 履历详情 */
    checkRecDetails () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: this.projectId,
        device_id: this.parentForm.id,
        dtype: this.parentForm.dtype
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/hardware/v1.0/selHardwareVsOnly',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          // 履历详情状态
          this.detRecState = true
          const itemData = res.data.data1
          // 注册时间
          let registime = itemData.registime
          const index = registime.indexOf('.')
          let time = registime.substring(0, index)
          // 版本信息
          const vsm = itemData.vsm
          let list = vsm.map(item => {
            return {
              create_time: this.$common.formatDate(item.create_time),
              version: item.version
            }
          })
          this.detRecForm = {
            time: time,
            firm: itemData.organize_name,
            list: list
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
    // 格式化serial地址
    formatSetSerial (str) {
      if (!str) { return '' }
      let value = str.toUpperCase()
      return value.replace(/:/g, '')
    },
    // 格式化Mac地址
    formatSetMac (str) {
      let value = str.toLowerCase()
      value = value.replace(/:/g, '')
      value = value.replace(/(.{2})/g, '$1:')
      const lastStr = value.charAt(value.length - 1)
      return lastStr === ':' ? value.substr(0, value.length - 1) : value
    },
    /* 关闭 */
    closeClick () {
      this.$emit('parentClose')
    }
  },
  watch: {
    parentDialog (val, oldVal) {
      if (val) {
        this.detInit()
      }
    },
    'parentForm.dtype' (val, oldVal) {
      if (val === 'cjk') {
        this.tabDisabled = false
      } else {
        this.tabDisabled = true
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
