<template>
  <div class="main">
    <el-container style="height: 100%">
      <el-header class="main-header">
        <div class="left main-header-title">
          <img src="../assets/images/logo.png" height="42" alt="">
          <h2 class="title">{{ companyName }}</h2>
        </div>
        <div class="right main-header-nav">
          <div class="nav-item">
            <el-select v-model="nowProjectId" filterable placeholder="请选择项目" :disabled="proDisabled" @change="projectChange">
              <el-option
                v-for="item in allProject"
                :key="item.project_id"
                :label="item.project_name"
                :value="item.project_id">
              </el-option>
            </el-select>
          </div>
          <div class="nav-item" v-if="authority.user">
            <router-link class="log" to="/main/log"><i class="iconfont icon-log" style="font-size: 32px;"></i></router-link>
          </div>
          <div class="nav-item">
            <router-link to="/main/message">
              <el-badge :value="unreadMesCount" :max="99" class="mes-hint">
                <i class="iconfont icon-xiaoxi"></i>
              </el-badge>
            </router-link>
          </div>
          <div class="nav-item">
            <div class="user">
              <el-dropdown class="user-item user-img">
                <div class="el-dropdown-link img">
                  <img :src="iconUrl" alt="" />
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item><a href="javascript:void(0);" @click="introDialog = true">个人资料</a></el-dropdown-item>
                  <el-dropdown-item><a href="javascript:void(0);" @click="pwdDialog = true">修改密码</a></el-dropdown-item>
                  <el-dropdown-item><a href="javascript:void(0);" @click="quitLogin">退出登录</a></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <div class="user-item">
                <p>{{ userName }}</p>
              </div>
            </div>
          </div>
        </div>
      </el-header>
      <el-container class="main-container" style="height: 100%">
        <el-aside width="240px" class="main-menu">
          <el-menu
            :unique-opened="true"
            :router="true"
            :default-active="menuActive"
            text-color="#fff"
            background-color="#2f4055"
            active-text-color="#fff">
            <el-menu-item index="/main/home" style="font-size: 0;">
              <i class="iconfont icon-yemian-copy-copy-copy-copy"></i>
              <span slot="title" style="font-size: 18px;">首页</span>
            </el-menu-item>
            <el-submenu index="1" class="submenu-item" v-if="authority.user">
              <template slot="title"><i class="iconfont icon-qiye"></i>企业配置</template>
              <el-menu-item-group v-if="authority.organ">
                <el-menu-item index="/main/organ">组织管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.user">
                <el-menu-item index="/main/user">用户管理</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="2" class="submenu-item" v-if="authority.user">
              <template slot="title"><i class="iconfont icon-shezhi"></i>基础配置</template>
              <el-menu-item-group>
                <el-menu-item index="/main/position">位置管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/site">地址管理</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="3" class="submenu-item" v-if="authority.user">
              <template slot="title"><i class="iconfont icon-pinzhibaozhang"></i>品质过程管理</template>
              <el-menu-item-group>
                <el-menu-item index="/main/crewclock">人员打卡率报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/poscover">位置巡查覆盖率</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/posclock">位置打卡记录</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/trackall">轨迹记录总览</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/trackdet">轨迹记录详情</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="4" class="submenu-item">
              <template slot="title"><i class="iconfont icon-xunjianguanli"></i>巡检巡查</template>
              <el-menu-item-group v-if="authority.user">
                <el-menu-item index="/main/group">组管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group v-if="authority.user">
                <el-menu-item index="/main/plan">巡检计划管理</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/task">巡检任务</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/calendar">巡检日历</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="5" class="submenu-item" v-if="authority.user">
              <template slot="title"><i class="iconfont icon-dianmin"></i>点名管理</template>
              <el-menu-item-group>
                <el-menu-item index="/main/callname-set">点名设置</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/callname-rep">点名报表</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="6" class="submenu-item" v-if="authority.user">
              <template slot="title"><i class="iconfont icon-shebeiguanli1"></i>设备管理</template>
              <el-menu-item-group>
                <el-menu-item index="/main/hardfac">硬件设备管理</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="7" class="submenu-item" v-if="authority.user">
              <template slot="title"><i class="iconfont icon-baobiaoguanli"></i>报表管理</template>
              <el-menu-item-group>
                <el-menu-item index="/main/report-task">巡检任务执行报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/report-site">巡检地址信息报表</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group>
                <el-menu-item index="/main/report-staff">个人巡检执行报表</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main class="main-module">
          <!--<router-view />-->
          <keep-alive>
            <router-view v-if="$route.meta.keepAlive"/>
          </keep-alive>
          <router-view v-if="!$route.meta.keepAlive"/>
        </el-main>
      </el-container>
    </el-container>
    <!-- 个人资料 -->
    <intro-module
      :parentDialog="introDialog"
      @parentClose="introClose">
    </intro-module>
    <!-- 修改密码 -->
    <pwd-module
      :parentDialog="pwdDialog"
      @parentClose="pwdClose">
    </pwd-module>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import initIcon from '../assets/images/head.png'
// 引入个人资料组件
import introModule from '@/components/profile/main-intro'
// 引入修改密码组件
import pwdModule from '@/components/profile/main-pwd'
export default{
  name: 'App',
  data () {
    return {
      menuActive: '',
      iconUrl: '',
      introDialog: false,
      pwdDialog: false,
      nowProjectId: 0
    }
  },
  created () {
    this.nowProjectId = this.projectId
    this.menuActive = this.$route.path
  },
  mounted () {
    // 头像
    let iconUrl = this.userPhoto
    if (iconUrl) {
      iconUrl = '/ezx_jk/showImage?state=0&filename=' + iconUrl
    } else {
      iconUrl = initIcon
    }
    this.iconUrl = iconUrl
    // 未读消息数
    this.getMesUnread()
  },
  components: {
    introModule,
    pwdModule
  },
  computed: {
    ...mapState('user', [
      'companyName',
      'companyId',
      'userId',
      'userName',
      'userPhoto',
      'authority'
    ]),
    ...mapState('other', [
      'allProject',
      'projectId',
      'proDisabled',
      'unreadMesCount'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setNowProject',
      'setUnreadMes'
    ]),
    // 保存项目id
    projectChange (value) {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: value
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/switchProject',
        data: params
      }).then((res) => {
        // 保存用户当前项目
        const nowProject = this.allProject.find(item => {
          return item.project_id === value
        })
        let project = {
          id: nowProject.project_id,
          name: nowProject.project_name,
          orgId: nowProject.organize_id,
          companyId: nowProject.company_id
        }
        this.setNowProject(project)
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '服务器连接失败！',
          type: 'error'
        })
      })
    },
    /* 个人资料 */
    introClose () {
      this.introDialog = false
    },
    /* 修改密码 */
    pwdClose () {
      this.pwdDialog = false
    },
    /* 消息 */
    getMesUnread () {
      let params = {
        company_id: this.companyId,
        user_id: this.userId,
        project_id: 0
      }
      params = this.$qs.stringify(params)
      this.$axios({
        method: 'post',
        url: '/ezx_jk/findNrMyMessageTotal',
        data: params
      }).then((res) => {
        if (res.data.result === 'Sucess') {
          const itemData = res.data.data1[0]
          // 工作通知
          const workCount = itemData.workNrTotal || 0
          // e掌巡管理助手
          const helperCount = itemData.manageNrTotal || 0
          // e掌巡管理小秘书
          const clerkCount = itemData.secretaryNrTotal || 0
          // 总未读数
          const allCount = workCount + helperCount + clerkCount
          this.setUnreadMes(allCount)
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
    // 跳转消息
    messageClick () {
      // 跳转
      this.$router.push({ path: '/main/message' })
    },
    /* 退出登录 */
    quitLogin () {
      sessionStorage.removeItem('wxWebToken')
      this.$router.push({ path: '/login/cipher' })
    }
  },
  watch: {
    projectId (newVal, oldVal) {
      // 刷新页面
      this.$router.go(0)
    }
  }
}
</script>

<style lang="less">
  .main{
    height: 100%;
    .main-header {
      height: 60px;
      padding: 0 20px;
      background: #4e97d8;
      color: #fff;
      .main-header-title{
        font-size: 0;
        img{
          vertical-align: middle;
        }
        .title{
          display: inline-block;
          vertical-align: middle;
          margin-left: 5px;
          line-height: 60px;
          font-size: 24px;
        }
      }
      .main-header-nav{
        font-size: 0;
        .bd-right{
          border-right: 1px solid #ffffff;
        }
        .nav-item{
          vertical-align: middle;
          display: inline-block;
          padding: 0 10px;
          height: 60px;
          line-height: 60px;
          .mes-hint{
            text-align: center;
            line-height: 40px;
            width: 40px;
            height: 40px;
            cursor: pointer;
            .iconfont{
              color: #ffffff;
              font-size: 32px;
            }
          }
          .user{
            .user-item{
              display: inline-block;
              vertical-align: middle;
              p{
                padding-left: 10px;
                line-height: 24PX;
                font-size: 14px;
                color: #ffffff;
              }
              &.user-img{
                .img{
                  width: 38px;
                  height: 38px;
                  border-radius: 50%;
                  overflow: hidden;
                  background: #ffffff;
                  img{
                    width: 38px;
                    height: 38px;
                  }
                }
              }
            }

          }
          .log{
            .iconfont{
              font-size: 24px;
              color: #ffffff;
            }
          }
        }
      }
      .nav-date{
        .txt{
          font-size: 12px;
        }
      }
    }
    .main-container{
      .main-menu{
        height: 100%;
        padding-bottom: 20px;
        background-color: #2f4055;
        .el-menu{
          border-right: none;
          .iconfont{
            color: #ffffff;
            font-size: 24px;
            margin-right: 10px;
          }
          .el-submenu__icon-arrow{
            font-size: 18px;
            color: #ffffff;
          }
          .el-submenu__title{
            font-size: 18px;
            background-color: #2f4055 !important;
          }
          .el-menu-item-group .el-menu-item-group__title{
            padding: 0;
          }
          .submenu-item .el-menu-item {
            background-color: #253344 !important;
          }
          .el-menu-item.is-active{
            background: #1d2c3e !important;
          }
          .el-icon-arrow-down:before {
            content: "\E60E";
          }
          .el-submenu.is-opened>.el-submenu__title .el-submenu__icon-arrow{
            transform: rotateZ(90deg);
          }
        }
      }
      .main-module {
        height: 100%;
        padding-top: 0;
        padding-left: 0;
        padding-right: 0;
        padding-bottom: 20px;
        background: #f0f3f4;
      }
    }
  }
</style>
