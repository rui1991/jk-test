<template>
  <div class="posclock">
    <el-container class="module-container">
      <el-header class="module-header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>品质过程管理</el-breadcrumb-item>
          <el-breadcrumb-item>位置打卡记录</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>
      <el-main class="module-main">
        <div class="nav">
          <el-radio-group v-model="navActive" @change="navChange">
            <el-radio-button :label="1">位置打卡记录汇总</el-radio-button>
            <el-radio-button :label="2">人员打卡记录详情</el-radio-button>
          </el-radio-group>
        </div>
        <keep-alive>
          <router-view v-if="$route.meta.keepAlive"/>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"/>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default{
  name: 'posclock',
  data () {
    return {
      navActive: ''
    }
  },
  mounted () {
    const navActive = this.posclockNav
    this.navActive = navActive
    if (navActive === 1) {
      this.$router.push({ path: '/main/posclock/posclockall' })
    } else if (navActive === 2) {
      this.$router.push({ path: '/main/posclock/posclockdet' })
    }
  },
  computed: {
    ...mapState('other', [
      'companyId',
      'projectId',
      'posclockNav'
    ])
  },
  methods: {
    ...mapActions('other', [
      'setPosclockNav'
    ]),
    navChange (val) {
      this.setPosclockNav(val)
      if (val === 1) {
        this.$router.push({ path: '/main/posclock/posclockall' })
      } else if (val === 2) {
        this.$router.push({ path: '/main/posclock/posclockdet' })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.posclock{
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
      .nav{
        padding-bottom: 20px;
      }
    }
  }
}
</style>
