/* 用户信息 */
const state = {
  companyId: '',
  companyName: '',
  userId: '',
  userName: '',
  roleId: '',
  sectorId: '',
  userPhone: '',
  userPhoto: '',
  authority: {
    organ: false,
    log: false,
    user: false,
    shift: false,
    scheduling: false,
    approval: false,
    site: false,
    plan: false,
    task: false,
    calendar: false,
    norm: false,
    abnormal: false,
    work: false,
    rule: false,
    polcard: false,
    polReport: false,
    workReport: false,
    videoSetting: false,
    videoPlaza: false,
    event: false
  },
  autDet: {
    organ: [],
    user: [],
    crew: [],
    shift: [],
    scheduling: [],
    approval: [],
    site: [],
    plan: [],
    task: [],
    calendar: [],
    norm: [],
    abnormal: [],
    work: [],
    rule: [],
    polcard: [],
    event: []
  }
}

const getters = {

}

const mutations = {
  // 保存基本信息
  SET_USER_INFO (state, obj) {
    state.companyId = obj.companyId
    state.companyName = obj.companyName
    state.userId = obj.userId
    state.userName = obj.userName
    state.roleId = obj.roleId
    state.sectorId = obj.sectorId
    state.userPhone = obj.userPhone
    state.userPhoto = obj.userPhoto
  },
  // 保存模块权限
  SET_MOD_AUTHORITY (state, obj) {
    state.authority = obj
  },
  // 保存权限详情
  SET_DET_AUTHORITY (state, obj) {
    state.autDet = obj
  }
}

const actions = {
  // 保存基本信息
  setUserInfo ({ commit }, value) {
    commit('SET_USER_INFO', value)
  },
  // 保存模块权限
  setModAuthority ({ commit }, value) {
    commit('SET_MOD_AUTHORITY', value)
  },
  // 保存权限详情
  setDetAuthority ({ commit }, value) {
    commit('SET_DET_AUTHORITY', value)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
