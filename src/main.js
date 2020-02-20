import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

// 引入axios
import axios from 'axios'

// 引入qs
import qs from 'qs'

// 引入element-ui
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

// 引入字体图标
import '@/assets/font/iconfont.css'

// 引入echarts
import echarts from 'echarts'

// 引入公共样式
import '@/assets/css/base.css'

// 引入全局过滤器
import * as custom from '@/utils/filter.js'

// 引入公用方法
import common from '@/utils/common.js'

// 引入兼容IE插件
import 'babel-polyfill'

// 引入播放器组件
import VideoPlayer from 'vue-video-player'
require('video.js/dist/video-js.css')
require('vue-video-player/src/custom-theme.css')

// 注册axios
// axios.defaults.baseURL = 'http://www.allsps.com:82'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
// axios.defaults.timeout = 60000
Vue.prototype.$axios = axios

// 注册qs
Vue.prototype.$qs = qs

// 注册elementui
Vue.use(ElementUI)

// 注册echarts
Vue.prototype.$echarts = echarts

// 注册播放器组件
Vue.use(VideoPlayer)

// 注册全局过滤器
Object.keys(custom).forEach(key => {
  Vue.filter(key, custom[key])
})

// 注册全局方法
Vue.prototype.$common = common

// 配置公共变量
Vue.prototype.baseUrl = () => 'http://szydak.eicp.net:82'
Vue.prototype.sysetApi = () => 'http://szydak.eicp.net:82/ezx_jk'
Vue.prototype.reportApi = () => 'http://szydak.eicp.net:8089'
Vue.prototype.loraApi = () => 'http://szydak.eicp.net:8099'

// Vue.prototype.baseUrl = () => 'http://192.168.1.177:8080'
// Vue.prototype.sysetApi = () => 'http://192.168.1.177:8080/ezx_jk'
// // Vue.prototype.sysetApi = () => 'http://szydak.eicp.net:82/ezx_syset'
// Vue.prototype.reportApi = () => 'http://192.168.1.177:8089'
// Vue.prototype.loraApi = () => 'http://192.168.1.177:8099'

// Vue.prototype.loraApi = () => '/apiUrl'

// Vue.prototype.baseUrl = () => 'http://www.allsps.com'
// Vue.prototype.sysetApi = () => 'http://www.allsps.com/ezx_syset'
// Vue.prototype.reportApi = () => 'http://www.allsps.com:8089'
// Vue.prototype.loraApi = () => 'http://www.bczdd.com:8099'

Vue.config.productionTip = false

// 注册请求拦截器
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('wxWebToken')
  const userId = store.state.user.userId
  const newUrl = config.url
  // const reqMethod = config.method.toLowerCase()
  if (token && newUrl.indexOf(':8089') === -1 && newUrl.indexOf(':8099') === -1) {
    config.headers.token = token
    config.headers.user_id = userId
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

// 注册全局导航守卫判断是否未登录
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('wxWebToken')
  if (token) {
    next()
  } else {
    if (to.path === '/login/cipher' || to.path === '/login/authcode' || to.path === '/findpwd') {
      next()
    } else {
      next({path: '/login/cipher'})
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
