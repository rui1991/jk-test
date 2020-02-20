import Vue from 'vue'
import Vuex from 'vuex'
// 用户基本信息
import user from './modules/user'
// 报表
import report from './modules/report'
// 其它
import other from './modules/other'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    report,
    other
  }
})

export default store
