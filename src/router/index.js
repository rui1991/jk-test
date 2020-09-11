import Vue from 'vue'
import Router from 'vue-router'

/* 登录 */
const Login = () => import(/* webpackChunkName: "group-login" */ '@/components/login')
// 密码登录
const Cipher = () => import(/* webpackChunkName: "group-login" */ '@/components/login/cipher')
// 验证码登录
const Authcode = () => import(/* webpackChunkName: "group-login" */ '@/components/login/authcode')

/* 找回密码 */
const Findpwd = () => import(/* webpackChunkName: "group-findpwd" */ '@/components/findpwd')

/* 主页面 */
const Main = () => import(/* webpackChunkName: "group-main" */ '@/components/main')

// 首页
const Home = () => import(/* webpackChunkName: "group-main" */ '@/components/profile/home')
// 消息
const Message = () => import(/* webpackChunkName: "group-message" */ '@/components/profile/message')
// 日志管理
const Log = () => import(/* webpackChunkName: "group-log" */ '@/components/profile/log')

/* 企业配置 */
// 组织管理
const Organ = () => import(/* webpackChunkName: "group-organ" */ '@/components/company/organ')
// 用户管理
const User = () => import(/* webpackChunkName: "group-user" */ '@/components/company/user')

/* 基础配置 */
// 位置管理
const Position = () => import(/* webpackChunkName: "group-position" */ '@/components/basics/position')
// 地址管理
const Site = () => import(/* webpackChunkName: "group-site" */ '@/components/basics/site')

/* 品质过程管理 */
// 人员管理汇总详情
const CrewcollectDet = () => import(/* webpackChunkName: "group-loccollect" */ '@/components/quality/crewcollect-det')
// 人员打卡率报表
const Crewclock = () => import(/* webpackChunkName: "group-crewclock" */ '@/components/quality/crewclock')
// 位置巡查覆盖率
const Poscover = () => import(/* webpackChunkName: "group-poscover" */ '@/components/quality/poscover')
// 位置打卡记录
const Posclock = () => import(/* webpackChunkName: "group-posclock" */ '@/components/quality/posclock')
// 位置打卡记录汇总
const Posclockall = () => import(/* webpackChunkName: "group-posclock" */ '@/components/quality/posclockall')
// 人员打卡记录详情
const Posclockdet = () => import(/* webpackChunkName: "group-posclock" */ '@/components/quality/posclockdet')
// 轨迹记录总览
const Trackall = () => import(/* webpackChunkName: "group-trackall" */ '@/components/quality/trackall')
// 轨迹记录详情
const Trackdet = () => import(/* webpackChunkName: "group-trackdet" */ '@/components/quality/trackdet')

/* 巡检巡查 */
// 组管理
const Group = () => import(/* webpackChunkName: "group-group" */ '@/components/polling/group')
// 巡检计划管理
const Plan = () => import(/* webpackChunkName: "group-plan" */ '@/components/polling/plan')
const PlanAdd = () => import(/* webpackChunkName: "group-plan" */ '@/components/polling/plan-add')
const PlanCom = () => import(/* webpackChunkName: "group-plan" */ '@/components/polling/plan-com')
// 巡检任务
const Task = () => import(/* webpackChunkName: "group-task" */ '@/components/polling/task')
const TaskCom = () => import(/* webpackChunkName: "group-task" */ '@/components/polling/task-com')
// 巡检日历
const Calendar = () => import(/* webpackChunkName: "group-calendar" */ '@/components/polling/calendar')
// 巡检日历详情
const CalendarItem = () => import(/* webpackChunkName: "group-calendar" */ '@/components/polling/calendar-item')
// 巡检标准维护
const Norm = () => import(/* webpackChunkName: "group-norm" */ '@/components/polling/norm')

/* 点名管理 */
// 点名设置
const CallnameSet = () => import(/* webpackChunkName: "group-callname" */ '@/components/callname/callname-set')
// 点名管理
const CallnameRep = () => import(/* webpackChunkName: "group-callname" */ '@/components/callname/callname-rep')

/* 设备管理 */
// 硬件设备管理
const Hardfac = () => import(/* webpackChunkName: "group-hardfac" */ '@/components/facility/hardfac')

/* 报表管理 */
// 巡检任务执行报表
const ReportTask = () => import(/* webpackChunkName: "group-report" */ '@/components/report/task')
// 巡检地址信息报表
const ReportSite = () => import(/* webpackChunkName: "group-report" */ '@/components/report/site')
// 个人巡检执行报表
const ReportStaff = () => import(/* webpackChunkName: "group-report" */ '@/components/report/staff')

/* 数据监控 */
// 异常设备监控
const Abnfacmon = () => import(/* webpackChunkName: "group-external" */ '@/components/datamon/abnfacmon')
// 异常设备监控 => 项目异常数据设备
const Proabnfac = () => import(/* webpackChunkName: "group-external" */ '@/components/datamon/proabnfac')
// 数据网关心跳监控
const Dataswgmon = () => import(/* webpackChunkName: "group-external" */ '@/components/datamon/dataswgmon')

Vue.use(Router)

export default new Router({
  linkActiveClass: 'link-active',
  routes: [
    {
      path: '/',
      redirect: '/login/cipher'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      redirect: '/login/cipher',
      children: [
        {
          path: 'cipher',
          name: 'cipher',
          component: Cipher
        },
        {
          path: 'authcode',
          name: 'authcode',
          component: Authcode
        }
      ]
    },
    {
      path: '/findpwd',
      name: 'findpwd',
      component: Findpwd
    },
    {
      path: '/main',
      name: 'main',
      component: Main,
      redirect: '/main/home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: Home,
          meta: {
            keepAlive: true
          }
        },
        {
          path: 'message',
          name: 'message',
          component: Message,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'organ',
          name: 'organ',
          component: Organ,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'log',
          name: 'log',
          component: Log,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'user',
          name: 'user',
          component: User,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'position',
          name: 'position',
          component: Position,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'site',
          name: 'site',
          component: Site,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'crewcollect-det',
          name: 'crewcollectDet',
          component: CrewcollectDet,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'crewclock',
          name: 'crewclock',
          component: Crewclock,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'poscover',
          name: 'poscover',
          component: Poscover,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'posclock',
          name: 'posclock',
          component: Posclock,
          // redirect: '/main/posclock/posclockall',
          meta: {
            keepAlive: false
          },
          children: [
            {
              path: 'posclockall',
              name: 'posclockall',
              component: Posclockall,
              meta: {
                keepAlive: true
              }
            },
            {
              path: 'posclockdet',
              name: 'posclockdet',
              component: Posclockdet,
              meta: {
                keepAlive: true
              }
            }
          ]
        },
        {
          path: 'trackall',
          name: 'trackall',
          component: Trackall,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'trackdet',
          name: 'trackdet',
          component: Trackdet,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'group',
          name: 'group',
          component: Group,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'plan',
          name: 'plan',
          component: Plan,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'plan-add',
          name: 'planAdd',
          component: PlanAdd,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'plan-com',
          name: 'planCom',
          component: PlanCom,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'task',
          name: 'task',
          component: Task,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'task-com',
          name: 'taskCom',
          component: TaskCom,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: Calendar,
          meta: {
            keepAlive: true
          }
        },
        {
          path: 'calendar-item',
          name: 'calendarItem',
          component: CalendarItem,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'norm',
          name: 'norm',
          component: Norm,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'callname-set',
          name: 'callnameSet',
          component: CallnameSet,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'callname-rep',
          name: 'callnameRep',
          component: CallnameRep,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'hardfac',
          name: 'hardfac',
          component: Hardfac,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'report-task',
          name: 'reportTask',
          component: ReportTask,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'report-site',
          name: 'reportSite',
          component: ReportSite,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'report-staff',
          name: 'reportStaff',
          component: ReportStaff,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'abnfacmon',
          name: 'abnfacmon',
          component: Abnfacmon,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'proabnfac',
          name: 'proabnfac',
          component: Proabnfac,
          meta: {
            keepAlive: false
          }
        },
        {
          path: 'dataswgmon',
          name: 'dataswgmon',
          component: Dataswgmon,
          meta: {
            keepAlive: false
          }
        }
      ]
    }
  ]
})
