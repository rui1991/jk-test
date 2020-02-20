<template>
  <div class="login">
    <div class="content">
      <h3 class="title">e掌巡-智慧安全综合管理平台</h3>
      <div class="login-box">
        <router-view />
      </div>
    </div>
    <p class="copy">深圳市黑卡科技有限公司&nbsp;&nbsp;粤ICP备17024484号</p>
  </div>
</template>

<script>
export default{
  name: 'login',
  data () {
    return {

    }
  },
  created () {
    // 判断网址是否合法
    // const nowHref = window.location.href
    // if (nowHref.indexOf('www.') === -1) {
    //   const skipHref = 'http://www.' + nowHref.replace(/http:\/\//, '')
    //   window.location.href = skipHref
    // }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
  .login{
    width: 100%;
    height: 100%;
    background: url("../assets/images/login_bg.jpg") no-repeat center center;
    background-size: cover;
    position: relative;
    .content{
      width: 440px;
      height: 380px;
      position: absolute;
      left: 75%;
      top: 50%;
      transform: translate(-50%, -50%);
      -ms-transform: translate(-50%, -50%);
      -moz-transform: translate(-50%, -50%);
      -webkit-transform: translate(-50%, -50%);
      -o-transform: translate(-50%, -50%);
      .title{
        text-align: center;
        color: #272727;
        font-size: 32px;
      }
      .login-box{
        padding: 60px 40px 0;
      }
    }
    .copy{
      width: 50%;
      text-align: center;
      color: #272727;
      font-size: 12px;
      position: absolute;
      left: 50%;
      bottom: 20px;
    }
  }
</style>
