<template>
  <div
    class="home"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.6)">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main" ref="homeMain">
        <div class="search">
          <span>组织机构</span>
          <el-input style="width: 240px; margin-left: 10px; margin-right: 20px;" :disabled="true" v-model="orgName"></el-input>
          <el-button type="primary" @click="orgDialog = true">选择组织</el-button>
        </div>
        <div class="dices">
          <el-row :gutter="60">
            <el-col :span="8">
              <div class="item staff">
                <div class="details">
                  <p class="single">
                    <span class="num">{{ dicesData.loginSize }}人</span>
                    <span class="txt">在线人数</span>
                  </p>
                  <p class="single">
                    <span class="num">{{ dicesData.userSize }}人</span>
                    <span class="txt">员工数量</span>
                  </p>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="item project">
                <div class="details">
                  <p class="single">
                    <span class="num">{{ dicesData.projectSize }}个</span>
                    <span class="txt">上线项目</span>
                  </p>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="item facility">
                <div class="details">
                  <p class="single">
                    <span class="num">{{ dicesData.onlineDevice }}个</span>
                    <span class="txt">在线设备</span>
                  </p>
                  <p class="single">
                    <span class="num">{{ dicesData.deviceSize }}个</span>
                    <span class="txt">设备数量</span>
                  </p>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="charts">
          <el-row :gutter="6" style="margin-bottom: 6px;">
            <el-col :span="12">
              <div class="item">
                <div class="item-title">
                  <span class="chunk"></span>
                  <p class="txt">巡检统计</p>
                </div>
                <div class="item-content">
                  <div class="describe two">
                    <div class="details">
                      <p class="single"><span class="txt">今日巡检任务</span><span class="num">{{ task.todayTask }}个</span></p>
                      <p class="single"><span class="txt">巡检任务准时率</span><span class="num">{{ task.endTimelyRatio | formatPercent }}</span></p>
                      <p class="single"><span class="txt">巡检任务完成率</span><span class="num">{{ task.endRatio | formatPercent }}</span></p>
                      <p class="single"><span class="txt">异常任务</span><span class="num">{{ task.abnormalSize }}个</span></p>
                    </div>
                  </div>
                  <div class="chart">
                    <Chart :parOption="taskOption" id="home_task" :domWidth="domWidth"></Chart>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="item">
                <div class="item-title">
                  <span class="chunk"></span>
                  <p class="txt">点名管理统计</p>
                </div>
                <div class="item-content">
                  <div class="describe three">
                    <div class="details">
                      <p class="single"><span class="txt">点名成功人数</span><span class="num">{{ callname.callnameSucceed }}人</span></p>
                      <p class="single"><span class="txt">点名失败人数</span><span class="num">{{ callname.callnameFailed }}人</span></p>
                    </div>
                  </div>
                  <div class="chart">
                    <Chart :parOption="callnameOption" id="home_callname" :domWidth="domWidth"></Chart>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="6">
            <el-col :span="12">
              <div class="item">
                <div class="item-title">
                  <span class="chunk"></span>
                  <p class="txt">位置打卡统计</p>
                </div>
                <div class="item-content">
                  <div class="describe three">
                    <div class="details">
                      <p class="single"><span class="txt">打卡有记录</span><span class="num">{{ position.positionExist }}个</span></p>
                      <p class="single"><span class="txt">打卡无记录</span><span class="num">{{ position.positionWithout }}个</span></p>
                    </div>
                  </div>
                  <div class="chart">
                    <Chart :parOption="positionOption" id="home_position" :domWidth="domWidth"></Chart>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="item">
                <div class="item-title">
                  <span class="chunk"></span>
                  <p class="txt">固定岗打卡统计</p>
                </div>
                <div class="item-content">
                  <div class="describe three">
                    <div class="details">
                      <p class="single"><span class="txt">打卡成功</span><span class="num">{{ fixation.fixationSucceed }}次</span></p>
                      <p class="single"><span class="txt">打卡失败</span><span class="num">{{ fixation.fixationFailed }}次</span></p>
                    </div>
                  </div>
                  <div class="chart">
                    <Chart :parOption="fixationOption" id="home_fixation" :domWidth="domWidth"></Chart>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
    <!-- 选择组织机构 -->
    <org-module
      :parentDialog="orgDialog"
      :parentId="orgId"
      :parentName="orgName"
      @parentUpdata="orgUpdata"
      @parentCancel="orgCancel">
    </org-module>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 引入组织组件
import orgModule from '@/components/profile/home-org'
// 引入chart
import Chart from '@/components/public/chart'
export default{
  name: 'home',
  data () {
    return {
      orgDialog: false,
      orgName: '',
      orgId: '',
      yestDate: '',
      dicesData: {
        loginSize: 0,
        userSize: 0,
        projectSize: 0,
        onlineDevice: 0,
        deviceSize: 0
      },
      task: {
        todayTask: 0,
        endTimelyRatio: 0,
        endRatio: 0,
        abnormalSize: 0
      },
      taskOption: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '巡检统计',
            type: 'pie',
            radius: ['45%', '65%'],
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: '{b} : {c}'
                },
                labelLine: {show: true}
              }
            },
            label: {
              normal: {
                show: true,
                position: 'outside',
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold',
                  color: '#646565'
                },
                formatter: '{b}\n{d}%'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 15,
                length2: 10,
                lineStyle: {
                  // color: '#666',
                  // width: 1
                }
              }
            },
            data: []
          }
        ],
        color: ['#44bd8a', '#d8d8d8']
      },
      callname: {
        callnameSucceed: 0,
        callnameFailed: 0
      },
      callnameOption: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '点名管理统计',
            type: 'pie',
            radius: ['45%', '65%'],
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: '{b} : {c}'
                },
                labelLine: {show: true}
              }
            },
            label: {
              normal: {
                show: true,
                position: 'outside',
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold',
                  color: '#646565'
                },
                formatter: '{b}\n{d}%'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 15,
                length2: 10,
                lineStyle: {
                  // color: '#666',
                  // width: 1
                }
              }
            },
            data: []
          }
        ],
        color: ['#44bd8a', '#d8d8d8']
      },
      position: {
        positionExist: 0,
        positionWithout: 0
      },
      positionOption: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '位置打卡统计',
            type: 'pie',
            radius: ['45%', '65%'],
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: '{b} : {c}'
                },
                labelLine: {show: true}
              }
            },
            label: {
              normal: {
                show: true,
                position: 'outside',
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold',
                  color: '#646565'
                },
                formatter: '{b}\n{d}%'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 15,
                length2: 10,
                lineStyle: {
                  // color: '#666',
                  // width: 1
                }
              }
            },
            data: []
          }
        ],
        color: ['#f1a555', '#d8d8d8']
      },
      fixation: {
        fixationSucceed: 0,
        fixationFailed: 0
      },
      fixationOption: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        series: [
          {
            name: '固定岗打卡统计',
            type: 'pie',
            radius: ['45%', '65%'],
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: '{b} : {c}'
                },
                labelLine: {show: true}
              }
            },
            label: {
              normal: {
                show: true,
                position: 'outside',
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold',
                  color: '#646565'
                },
                formatter: '{b}\n{d}%'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 15,
                length2: 10,
                lineStyle: {
                  // color: '#666',
                  // width: 1
                }
              }
            },
            data: []
          }
        ],
        color: ['#44bd8a', '#d8d8d8']
      },
      domWidth: this.$common.getDomClientSize().width,
      loading: false
    }
  },
  created () {

  },
  mounted () {
    this.yestDate = this.$common.getBeforeDate()
    // 监控窗口变化
    window.onresize = () => {
      const domWidth = this.$common.getDomClientSize().width
      this.domWidth = domWidth
    }
    this.orgName = this.projectName
    this.orgId = this.projectOrgId
    // 获取数据
    this.getHomeData()
  },
  components: {
    orgModule,
    Chart
  },
  computed: {
    ...mapState('user', [
      'userId',
      'roleId',
      'userPhone'
    ]),
    ...mapState('other', [
      'projectId',
      'projectOrgId',
      'projectName'
    ])
  },
  methods: {
    /* 选择组织 */
    orgUpdata (data) {
      this.orgId = data.id
      this.orgName = data.name
      this.orgDialog = false
      // 获取数据
      this.getNewHomeData()
    },
    orgCancel () {
      this.orgDialog = false
    },
    // 获取数据
    getHomeData () {
      let params = {
        organize_id: this.orgId,
        project_id: this.projectId
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.9/selMain',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const homeData = res.data.data1
          this.disHomeData(homeData)
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
        // this.$message({
        //   showClose: true,
        //   message: '服务器连接失败！',
        //   type: 'error'
        // })
      })
    },
    getNewHomeData () {
      let params = {
        organize_id: this.orgId
      }
      params = this.$qs.stringify(params)
      this.loading = true
      this.$axios({
        method: 'post',
        url: this.sysetApi() + '/v3.9/selMain',
        data: params
      }).then((res) => {
        this.loading = false
        if (res.data.result === 'Sucess') {
          const homeData = res.data.data1
          this.disHomeData(homeData)
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
        // this.$message({
        //   showClose: true,
        //   message: '服务器连接失败！',
        //   type: 'error'
        // })
      })
    },
    // 数据处理
    disHomeData (data) {
      /* 概况 */
      this.dicesData = {
        loginSize: data.loginSize,
        userSize: data.userSize,
        projectSize: data.projectSize,
        onlineDevice: data.onlineDevice,
        deviceSize: data.deviceSize
      }
      /* 巡检统计 */
      this.task = {
        todayTask: data.taskSize || 0,
        endTimelyRatio: data.endTimelyRatio,
        endRatio: data.endRatio,
        abnormalSize: data.abnormalSize
      }
      // 已完成任务
      const finishTask = data.endTaskSize || 0
      // 未完成任务
      const undoneTask = data.notTaskSize || 0
      const taskChart = [
        {value: finishTask, name: '巡检任务已完成'},
        {value: undoneTask, name: '巡检任务未完成'}
      ]
      this.taskOption.series[0].data = taskChart
      /* 点名管理统计 */
      const callnameSucceed = data.rcSucessSize || 0
      const callnameFailed = data.rcFailedSize || 0
      this.callname = {
        callnameSucceed: callnameSucceed,
        callnameFailed: callnameFailed
      }
      const callnameChart = [
        {value: callnameSucceed, name: '成功人数'},
        {value: callnameFailed, name: '失败人数'}
      ]
      this.callnameOption.series[0].data = callnameChart

      /* 位置打卡统计 */
      const positionExist = data.haveRecordSize || 0
      const positionWithout = data.notRecordSize || 0
      this.position = {
        positionExist: positionExist,
        positionWithout: positionWithout
      }
      const positionChart = [
        {value: positionExist, name: '有记录'},
        {value: positionWithout, name: '无记录'}
      ]
      this.positionOption.series[0].data = positionChart

      /* 固定岗打卡统计 */
      const fixationSucceed = data.permanentSucessSize || 0
      const fixationFailed = data.permanentFailedSize || 0
      this.fixation = {
        fixationSucceed: fixationSucceed,
        fixationFailed: fixationFailed
      }
      const fixationChart = [
        {value: fixationSucceed, name: '成功数'},
        {value: fixationFailed, name: '失败数'}
      ]
      this.fixationOption.series[0].data = fixationChart
    }
  }
}
</script>

<style lang="less" scoped>
.home{
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
      padding: 0;
      margin-left: 20px;
      margin-right: 20px;
      .search{
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 70px;
        padding-left: 20px;
        padding-right: 20px;
        background: #ffffff;
        .hint{
          padding-left: 20px;
          color: #272727;
        }
        .track{
          flex-grow: 1;
          text-align: right;
        }
      }
      .dices{
        background: #ffffff;
        overflow: hidden;
        padding-left: 20px;
        padding-right: 20px;
        padding-bottom: 15px;
        .item{
          display: flex;
          align-items: center;
          height: 120px;
          padding: 10px;
          border-radius: 6px;
          .details{
            width: 100%;
            .single{
              display: flex;
              flex-direction: row;
              align-items: center;
              height: 40px;
              .num{
                flex-grow: 1;
                text-align: center;
                font-size: 24px;
                font-weight: 600;
                color: #ffffff;
              }
              .txt{
                flex-grow: 1;
                text-align: center;
                font-size: 18px;
                color: #ffffff;
              }
            }
          }
          &.staff{
            background:url(../../assets/images/staff-bg.jpg) no-repeat;
            background-size: cover;
          }
          &.project{
            background:url(../../assets/images/project-bg.jpg) no-repeat;
            background-size: cover;
          }
          &.facility{
            background:url(../../assets/images/facility-bg.jpg) no-repeat;
            background-size: cover;
          }
        }
      }
      .charts{
        margin-top: 10px;
        overflow: hidden;
        .item{
          display: flex;
          flex-direction: column;
          padding: 20px;
          background: #ffffff;
          .item-title {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 30px;
            .chunk {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #4e97d8;
            }
            .txt {
              padding-left: 10px;
              font-size: 18px;
              color: #333;
            }
          }
          .item-content{
            display: flex;
            flex-direction: row;
            height: 230px;
            .describe{
              display: flex;
              align-items: center;
              .details{
                .single{
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  height: 35px;
                  .txt{
                    font-size: 14px;
                  }
                  .num{
                    font-size: 14px;
                  }
                }
              }
              &.two{
                width: 240px;
                .txt{
                  width: 120px;
                }
              }
              &.three{
                width: 180px;
                .txt{
                  width: 100px;
                }
              }
            }
            .chart{
              flex-grow: 1;
            }
          }
        }
      }
    }
  }
}
</style>
