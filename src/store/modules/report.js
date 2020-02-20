/* 报表信息 */
const state = {
  organizeId: 0,
  organizeType: 0,
  projectId: 0,
  date: []
}

const getters = {

}

const mutations = {
  // 设置报表组织
  SET_REPORT_ORG (state, obj) {
    state.organizeId = obj.id
    state.organizeType = obj.type
    state.projectId = obj.proId
  },
  // 设置当前项目
  SET_REPORT_DATE (state, arr) {
    state.date = arr
  }
}

const actions = {
  // 设置报表组织
  setReportOrg ({ commit }, value) {
    commit('SET_REPORT_ORG', value)
  },
  // 设置报表时间
  setReportDate ({ commit }, value) {
    commit('SET_REPORT_DATE', value)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
