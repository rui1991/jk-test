/* 其它信息 */
const state = {
  allProject: [],
  projectId: 0,
  projectName: '',
  projectOrgId: 0,
  companyId: 0,
  proDisabled: false,
  unreadMesCount: 0,
  orgTree: [],
  orgData: [],
  posclockNav: 1
}

const getters = {

}

const mutations = {
  // 设置所有项目
  SET_ALL_PROJECT (state, arr) {
    state.allProject = arr
  },
  // 设置当前项目
  SET_NOW_PROJECT (state, obj) {
    state.projectId = obj.id
    state.projectName = obj.name
    state.projectOrgId = obj.orgId
    state.companyId = obj.companyId
  },
  // 设置全局项目可选状态
  SET_PRO_DISABLED (state, boo) {
    state.proDisabled = boo
  },
  // 设置未读消息数
  SET_UNREAD_MES (state, num) {
    state.unreadMesCount = num || ''
  },
  // 设置机构树
  SET_ORGAN_TREE (state, arr) {
    state.orgTree = arr
  },
  // 设置机构树
  SET_ORGAN_DATA (state, arr) {
    state.orgData = arr
  },
  // 设置位置打卡导航
  SET_POSCLOCK_Nav (state, num) {
    state.posclockNav = num
  }
}

const actions = {
  // 设置所有项目
  setAllProject ({ commit }, value) {
    commit('SET_ALL_PROJECT', value)
  },
  // 设置当前项目
  setNowProject ({ commit }, value) {
    commit('SET_NOW_PROJECT', value)
  },
  // 设置全局项目可选状态
  setProDisabled ({ commit }, value) {
    commit('SET_PRO_DISABLED', value)
  },
  // 设置未读消息数
  setUnreadMes ({ commit }, value) {
    commit('SET_UNREAD_MES', value)
  },
  // 设置机构树
  setOrganTree ({ commit }, value) {
    commit('SET_ORGAN_TREE', value)
  },
  // 设置机构树
  setOrganData ({ commit }, value) {
    commit('SET_ORGAN_DATA', value)
  },
  // 设置位置打卡导航
  setPosclockNav ({ commit }, value) {
    commit('SET_POSCLOCK_Nav', value)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
