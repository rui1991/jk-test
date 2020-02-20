<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  created () {
    // 在页面加载时读取sessionStorage里的状态信息
    if (sessionStorage.getItem('webStore')) {
      this.$store.replaceState(Object.assign({}, this.$store.state, JSON.parse(sessionStorage.getItem('webStore'))))
    }
    // 在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('webStore', JSON.stringify(this.$store.state))
    })
  }
}
</script>

<style lang="less">
  #app{
    height: 100%;
  }
</style>
