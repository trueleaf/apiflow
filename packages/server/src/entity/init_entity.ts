import { ReturnModelType } from '@typegoose/typegoose';
import { User } from './security/user.js';
import { ServerRoutes } from './security/server_routes.js';
import { ClientRoutes } from './security/client_routes.js';
import { Role } from './security/role.js';
import { ClientMenu } from './security/client_menu.js';
import { Attachment } from './attachment/attachment.js';

/*
|--------------------------------------------------------------------------
| 初始化数据
|--------------------------------------------------------------------------
*/
const INITIAL_USER = [
  {
    clientRoutes: [] as User['clientRoutes'],
    clinetMenus: [] as User['clinetMenus'],
    isEnabled: true,
    loginName: 'admin',
    password: '9326d7bc07bc0b581aad7229f0f399bc',
    lastLogin: new Date(),
    roleIds: [
      '5edf71f2193c7d5fa0ec9b98',
      '5ede0ba06f76185204584700',
    ],
    roleNames: ['管理员'],
    salt: '3219317',
    serverRoutes: [] as User['serverRoutes'],
    starProjects: [] as User['starProjects'],
  },
  {
    clientRoutes: [],
    clinetMenus: [],
    isEnabled: true,
    loginName: 'apiflow',
    lastLogin: new Date(),
    password: '8330f8593ee879be8c1eaedfcad75efb',
    roleIds: ['5ede0ba06f76185204584700'],
    roleNames: ['普通用户'],
    salt: '2841279',
    serverRoutes: [],
    starProjects: [],
  },
  {
    clientRoutes: [],
    clinetMenus: [],
    isEnabled: true,
    loginName: 'apiflow2',
    lastLogin: new Date(),
    password: '8330f8593ee879be8c1eaedfcad75efb',
    roleIds: ['5ede0ba06f76185204584700'],
    roleNames: ['普通用户'],
    salt: '2841279',
    serverRoutes: [],
    starProjects: [],
  },
];
const INITIAL_SERVER_ROUTES = [
  //=========================================================================//
  //全局公共请求头
  {
    _id: '67bd4893d9884f97a42261ff',
    groupName: 'api文档-全局公共请求头',
    method: 'get',
    name: '获取全局公共请求头',
    path: '/api/project/global_common_headers',
  },
  {
    _id: '67bd4893d9884f97a42863fe',
    groupName: 'api文档-全局公共请求头',
    method: 'put',
    name: '替换全局公共请求头',
    path: '/api/project/replace_global_common_headers',
  },
  //组相关
  {
    _id: '67bd4893d9884f97a42861ff',
    groupName: 'api文档-团队(组)相关',
    method: 'post',
    name: '创建组',
    path: '/api/group/create',
  },
  {
    _id: '67bd4893d9884f97a42869ff',
    groupName: 'api文档-团队(组)相关',
    method: 'delete',
    name: '删除组',
    path: '/api/group/remove',
  },
  {
    _id: '67bd4893d9884f97a42862ff',
    groupName: 'api文档-团队(组)相关',
    method: 'put',
    name: '更新组',
    path: '/api/group/update',
  },
  {
    _id: '67bd4893d9884f97a42864ff',
    groupName: 'api文档-团队(组)相关',
    method: 'get',
    name: '列表形式返回组信息',
    path: '/api/group/list',
  },
  {
    _id: '67bd4893d9884f97a42865ff',
    groupName: 'api文档-团队(组)相关',
    method: 'post',
    name: '添加组成员',
    path: '/api/group/member/add',
  },
  {
    _id: '67bd4893d9884f97a42866ff',
    groupName: 'api文档-团队(组)相关',
    method: 'delete',
    name: '删除组成员',
    path: '/api/group/member/remove',
  },
  {
    _id: '67bd4893d9884f97a42867ff',
    groupName: 'api文档-团队(组)相关',
    method: 'put',
    name: '更新组成员权限',
    path: '/api/group/member/permission',
  },
  //附件
  {
    _id: '64e1d43690009434b395eeef',
    groupName: 'api文档-项目相关',
    method: 'get',
    name: '获取某个请求头',
    path: '/api/project/common_header_by_id',
  },
  {
    _id: '64e1d47d62cd860d73bdebfc',
    groupName: 'api文档-项目相关',
    method: 'get',
    name: '获取所有公共请求头',
    path: '/api/project/common_headers',
  },
  {
    _id: '64e1d530636bd4b5b317cb79',
    groupName: 'api文档-项目相关',
    method: 'put',
    name: '修改公共请求头',
    path: '/api/project/common_header',
  },
  //=========================================================================//
  {
    _id: '5edd91af5fcdf3111671cb15',
    groupName: 'api文档-项目相关',
    method: 'post',
    name: '新增项目',
    path: '/api/project/add_project',
  },
  {
    _id: '5edd91af5fcdf3111671cb17',
    groupName: 'api文档-项目相关',
    method: 'get',
    name: '获取项目列表',
    path: '/api/project/project_list',
  },
  {
    _id: '5edd91af5fcdf3111671cb19',
    groupName: 'api文档-项目相关',
    method: 'get',
    name: '获取项目列表枚举',
    path: '/api/project/project_enum',
  },
  {
    _id: '5edd91af5fcdf3111671cb1b',
    groupName: 'api文档-项目相关',
    method: 'delete',
    name: '删除项目',
    path: '/api/project/delete_project',
  },
  {
    _id: '67f0a9b1c2d3e4f5a6b7c8d9',
    groupName: 'api文档-项目回收站',
    method: 'get',
    name: '获取已删除项目列表',
    path: '/api/project/project_deleted_list',
  },
  {
    _id: '67f0a9b1c2d3e4f5a6b7c8da',
    groupName: 'api文档-项目回收站',
    method: 'put',
    name: '恢复项目',
    path: '/api/project/project_restore',
  },
  {
    _id: '5edd91af5fcdf3111671cb1d',
    groupName: 'api文档-项目相关',
    method: 'put',
    name: '修改项目',
    path: '/api/project/edit_project',
  },
  {
    _id: '64cefefc162e81c50c5b497f',
    groupName: 'api文档-项目相关',
    method: 'get',
    name: '根据id获取项目完整信息',
    path: '/api/project/project_full_info',
  },
  {
    _id: '5edd91af5fcdf3111671cb29',
    groupName: 'api文档-文档操作',
    method: 'post',
    name: '新增空白文档',
    path: '/api/project/new_doc',
  },
  {
    _id: '5edd91af5fcdf3111671cb2b',
    groupName: 'api文档-文档操作',
    method: 'post',
    name: '拷贝文档',
    path: '/api/project/copy_doc',
  },
  {
    _id: '5edd91af5fcdf3111671cb2f',
    groupName: 'api文档-文档操作',
    method: 'put',
    name: '改变文档在位置',
    path: '/api/project/change_doc_pos',
  },
  {
    _id: '5edd91af5fcdf3111671cb31',
    groupName: 'api文档-文档操作',
    method: 'put',
    name: '修改节点信息(名称等)',
    path: '/api/project/change_doc_info',
  },
  {
    _id: '5edd91af5fcdf3111671cb33',
    groupName: 'api文档-文档操作',
    method: 'delete',
    name: '删除文档',
    path: '/api/project/doc',
  },
  {
    _id: '5edd91af5fcdf3111671cb35',
    groupName: 'api文档-文档操作',
    method: 'post',
    name: '更新文档',
    path: '/api/project/fill_doc',
  },
  {
    _id: '64f499d55495280730b3df8f',
    groupName: 'api文档-文档操作',
    method: 'post',
    name: '创建文档',
    path: '/api/project/save_doc',
  },
  {
    _id: '5edd91af5fcdf3111671cb37',
    groupName: 'api文档-文档操作',
    method: 'get',
    name: '获取文档导航',
    path: '/api/project/doc_tree_node',
  },
  {
    _id: '5edd91af5fcdf3111671cb39',
    groupName: 'api文档-文档操作',
    method: 'get',
    name: '获取文档详情',
    path: '/api/project/doc_detail',
  },
  {
    _id: '5edd91b15fcdf3111671cb75',
    groupName: '权限相关-登录注册',
    method: 'post',
    name: '用户名密码登录',
    path: '/api/security/login_password',
  },
  {
    _id: '5edd91b15fcdf3111671cb76',
    groupName: '权限相关-登录注册',
    method: 'get',
    name: '验证登录状态',
    path: '/api/security/verify_login',
  },
  {
    _id: '5edd91b15fcdf3111671cb77',
    groupName: '权限相关-登录注册',
    method: 'get',
    name: '获取验证码',
    path: '/api/security/captcha',
  },
  {
    _id: '5edd91b15fcdf3111671cb79',
    groupName: '权限相关-用户管理',
    method: 'get',
    name: '获取用户列表',
    path: '/api/security/user_list',
  },
  {
    _id: '5edd91b15fcdf3111671cb7b',
    groupName: '权限相关-用户管理',
    method: 'put',
    name: '启用和禁用用户',
    path: '/api/security/user_state',
  },
  {
    _id: '60a35ac840b59032c9225c41',
    groupName: '权限相关-用户管理',
    method: 'put',
    name: '管理员重置密码',
    path: '/api/security/reset_password',
  },
  {
    _id: '5edd91b15fcdf3111671cb7d',
    groupName: '权限相关-用户管理',
    method: 'put',
    name: '修改用户权限相关内容',
    path: '/api/security/user_permission',
  },
  {
    _id: '5edd91b15fcdf3111671cb7f',
    groupName: '权限管理-前端路由',
    method: 'post',
    name: '新增前端路由',
    path: '/api/security/client_routes',
  },
  {
    _id: '5edd91b15fcdf3111671cb83',
    groupName: '权限管理-前端路由',
    method: 'delete',
    name: '删除前端路由',
    path: '/api/security/client_routes',
  },
  {
    _id: '5edd91b15fcdf3111671cb85',
    groupName: '权限管理-前端路由',
    method: 'put',
    name: '修改前端路由',
    path: '/api/security/client_routes',
  },
  {
    _id: '5edd91b15fcdf3111671cb87',
    groupName: '权限管理-前端路由',
    method: 'put',
    name: '批量修改前端路由类型',
    path: '/api/security/client_routes_type',
  },
  {
    _id: '5edd91b15fcdf3111671cb8b',
    groupName: '权限管理-前端路由',
    method: 'get',
    name: '获取前端路由(不分页',
    path: '/api/security/client_routes',
  },
  {
    _id: '5edd91b15fcdf3111671cb8f',
    groupName: '权限管理-后端路由',
    method: 'post',
    name: '新增后端路由',
    path: '/api/security/server_routes',
  },
  {
    _id: '5edd91b15fcdf3111671cb91',
    groupName: '权限管理-后端路由',
    method: 'delete',
    name: '删除后端路由',
    path: '/api/security/server_routes',
  },
  {
    _id: '5edd91b15fcdf3111671cb93',
    groupName: '权限管理-后端路由',
    method: 'put',
    name: '修改后端路由',
    path: '/api/security/server_routes',
  },
  {
    _id: '5edd91b15fcdf3111671cb95',
    groupName: '权限管理-后端路由',
    method: 'put',
    name: '批量修改后端路由类型',
    path: '/api/security/server_routes_type',
  },
  {
    _id: '5edd91b15fcdf3111671cb99',
    groupName: '权限管理-后端路由',
    method: 'get',
    name: '获取后端路由(不分页',
    path: '/api/security/server_routes',
  },
  {
    _id: '5edd91b15fcdf3111671cb9b',
    groupName: '权限管理-前端菜单',
    method: 'get',
    name: '获取前端菜单',
    path: '/api/security/client_menu_tree',
  },
  {
    _id: '5edd91b15fcdf3111671cb9d',
    groupName: '权限管理-前端菜单',
    method: 'post',
    name: '新增前端菜单',
    path: '/api/security/client_menu',
  },
  {
    _id: '5edd91b15fcdf3111671cb9f',
    groupName: '权限管理-前端菜单',
    method: 'put',
    name: '修改前端菜单',
    path: '/api/security/client_menu',
  },
  {
    _id: '5edd91b15fcdf3111671cba1',
    groupName: '权限管理-前端菜单',
    method: 'delete',
    name: '删除前端菜单',
    path: '/api/security/client_menu',
  },
  {
    _id: '5edd91b25fcdf3111671cba3',
    groupName: '权限管理-前端菜单',
    method: 'put',
    name: '改变菜单位置',
    path: '/api/security/client_menu_position',
  },
  {
    _id: '5edd91b25fcdf3111671cba5',
    groupName: '权限相关-角色管理',
    method: 'get',
    name: '获取角色列表',
    path: '/api/security/role_list',
  },
  {
    _id: '5edd91b25fcdf3111671cba7',
    groupName: '权限相关-角色管理',
    method: 'get',
    name: '获取角色信息',
    path: '/api/security/role_info',
  },
  {
    _id: '5edd91b25fcdf3111671cba9',
    groupName: '权限相关-角色管理',
    method: 'get',
    name: '获取角色枚举',
    path: '/api/security/role_enum',
  },
  {
    _id: '5edd91b25fcdf3111671cbab',
    groupName: '权限相关-角色管理',
    method: 'post',
    name: '新增角色',
    path: '/api/security/role',
  },
  {
    _id: '5edd91b25fcdf3111671cbad',
    groupName: '权限相关-角色管理',
    method: 'put',
    name: '修改角色',
    path: '/api/security/role',
  },
  {
    _id: '5edd91b25fcdf3111671cbaf',
    groupName: '权限相关-角色管理',
    method: 'delete',
    name: '删除角色',
    path: '/api/security/role',
  },
  {
    _id: '5ee7623c1481a140fc10f67f',
    groupName: '权限相关-用户管理',
    method: 'post',
    name: '新增单个账号',
    path: '/api/security/useradd',
  },
  {
    _id: '5ee9a3ecf4365169e46c0b20',
    groupName: '权限相关-用户管理',
    method: 'get',
    name: '根据id获取用户信息',
    path: '/api/security/user_info_by_id',
  },
  {
    _id: '5ef085889b54825e2c9dc8d0',
    groupName: '权限相关-用户管理',
    method: 'get',
    name: '根据名称查询用户列表',
    path: '/api/security/userListByName',
  },
  {
    _id: '5ef085889b54825e2c9dc8d1',
    groupName: '权限相关-用户管理',
    method: 'get',
    name: '根据名称|手机号|组名查询列表',
    path: '/api/security/userOrGroupListByName',
  },
  {
    _id: '5f1e44d63e2abf46ec9956e3',
    groupName: 'api文档-全局变量',
    method: 'post',
    name: '新增全局变量',
    path: '/api/project/project_variable',
  },
  {
    _id: '5f1e44e93e2abf46ec9956e4',
    groupName: 'api文档-全局变量',
    method: 'get',
    name: '获取全局变量列表',
    path: '/api/project/project_variable',
  },
  {
    _id: '5f1e44e93e2abf46ec9956e3',
    groupName: 'api文档-全局变量',
    method: 'get',
    name: '获取全局变量列表不分页',
    path: '/api/project/project_variable_enum',
  },
  {
    _id: '5f1e44f33e2abf46ec9956e5',
    groupName: 'api文档-全局变量',
    method: 'put',
    name: '修改全局变量',
    path: '/api/project/project_variable',
  },
  {
    _id: '5f1e45053e2abf46ec9956e6',
    groupName: 'api文档-全局变量',
    method: 'delete',
    name: '删除全局变量',
    path: '/api/project/project_variable',
  },
  {
    _id: '5f1e85a991093c38a013c312',
    groupName: 'api文档-全局变量',
    method: 'get',
    name: '获取全局变量枚举',
    path: '/api/project/project_variable_enum',
  },
  {
    _id: '5f29180adff3fd0f6823d633',
    groupName: '权限相关-用户管理',
    method: 'post',
    name: '通过excel批量导入用户',
    path: '/api/security/add_user_by_excel',
  },
  {
    _id: '5f4cf1ddf8a3c9267429c080',
    groupName: '权限相关-用户管理',
    method: 'get',
    name: '获取用户信息',
    path: '/api/security/user_info',
  },
  {
    _id: '5f4dc07a97fc7c39f819f4c0',
    groupName: '权限相关-用户管理',
    method: 'put',
    name: '修改用户密码',
    path: '/api/security/user_password',
  },
  {
    _id: '5fade1e3b229918054fb4f90',
    groupName: 'api文档-导入导出',
    method: 'post',
    name: '导出为离线html',
    path: '/api/project/export/html',
  },
  {
    _id: '64d3a7b9a9647387b308467c',
    groupName: 'api文档-导入导出',
    method: 'post',
    name: '导出为word',
    path: '/api/project/export/word',
  },
  {
    _id: '67bd4893d9884f97a42260aa',
    groupName: 'api文档-导入导出',
    method: 'post',
    name: '导入文档',
    path: '/api/project/import/moyu',
  },
  {
    _id: '5ff166479c0b4737b81ee490',
    groupName: 'api文档-项目相关',
    method: 'put',
    name: '最近访问',
    path: '/api/project/visited',
  },
  {
    _id: '5ff1792c972b5a29804e1ac3',
    groupName: 'api文档-项目相关',
    method: 'put',
    name: '收藏项目',
    path: '/api/project/star',
  },
  {
    _id: '5ff17a0defe2a82db087c9ea',
    groupName: 'api文档-项目相关',
    method: 'put',
    name: '取消收藏',
    path: '/api/project/unstar',
  },
  {
    _id: '601f546054cf18489c4a071a',
    groupName: 'api文档-导入导出',
    method: 'post',
    name: '导出为摸鱼文档',
    path: '/api/project/export/json',
  },
  {
    _id: '603b9a9cc953e62b80e42e12',
    groupName: 'api文档-在线链接',
    method: 'post',
    name: '生成在线链接',
    path: '/api/project/export/online',
  },
  {
    _id: '64e17ccb3131ab254994cba2',
    groupName: 'api文档-在线链接',
    method: 'put',
    name: '修改在线链接',
    path: '/api/project/export/online',
  },
  {
    _id: '64e17d7f969c4db3367cff4f',
    groupName: 'api文档-在线链接',
    method: 'delete',
    name: '删除在线链接',
    path: '/api/project/export/online',
  },
  {
    _id: '64e17dc611d757b112efc1e6',
    groupName: 'api文档-在线链接',
    method: 'get',
    name: '分页获取在线链接',
    path: '/api/project/export/online_list',
  },
  {
    _id: '64e1813e2cdf348b21007947',
    groupName: 'api文档-在线链接',
    method: 'get',
    name: '获取项目基本信息',
    path: '/api/project/share_info',
  },
  {
    _id: '64e1819072bd12f578811ed5',
    groupName: 'api文档-在线链接',
    method: 'get',
    name: '获取分享文档的banner信息',
    path: '/api/project/export/share_banner',
  },
  {
    _id: '64e181d972bd12f578811f01',
    groupName: 'api文档-在线链接',
    method: 'get',
    name: '获取分享项目接口详情',
    path: '/api/project/share_doc_detail',
  },
  {
    _id: '6056ca3ec8731d1cd490e95d',
    groupName: 'api文档-历史记录',
    method: 'get',
    name: '文档操作人员枚举',
    path: '/api/docs/docs_history_operator_enum',
  },
  {
    _id: '605844fa5de62017b64ec29b',
    groupName: 'api文档-文档操作',
    method: 'get',
    name: '获取文档导航(仅文件夹)',
    path: '/api/project/doc_tree_folder_node',
  },
  {
    _id: '60a35a65e7af1332c8669d5f',
    groupName: 'api文档-项目权限',
    method: 'post',
    name: '项目新增用户',
    path: '/api/project/add_user',
  },
  {
    _id: '64a8ee811f0b581286ed8189',
    groupName: 'api文档-项目权限',
    method: 'get',
    name: '获取项目成员信息',
    path: '/api/project/project_members',
  },
  {
    _id: '60a35a7de7af1332c8669d60',
    groupName: 'api文档-项目权限',
    method: 'delete',
    name: '项目删除用户',
    path: '/api/project/delete_user',
  },
  {
    _id: '60a35ac840b59032c9225c40',
    groupName: 'api文档-项目权限',
    method: 'put',
    name: '修改用户角色(权限)',
    path: '/api/project/change_permission',
  },
  {
    _id: '60a5c271e7af1332c866a57e',
    groupName: 'api文档-文档辅助',
    method: 'post',
    name: '粘贴接口',
    path: '/api/project/paste_docs',
  },
  {
    _id: '60a7483b40b59032c9226fc3',
    groupName: 'api文档-回收站',
    method: 'post',
    name: '获取被删除文档列表',
    path: '/api/docs/docs_deleted_list',
  },
  {
    _id: '60ab4dd440b59032c9227302',
    groupName: 'api文档-回收站',
    method: 'put',
    name: '恢复删除节点',
    path: '/api/docs/docs_restore',
  },
];
const INITIAL_CLIENT_ROUTES = [
  {
    _id: '5edd91c05fcdf3111671cbf4',
    groupName: 'api文档',
    name: 'api文档-文档详情',
    path: '/workbench',
  },
  {
    _id: '5edd91c05fcdf3111671cbfa',
    groupName: '权限管理',
    name: '权限管理',
    path: '/admin',
  },
];
const INITIAL_ROLE = [
  {
    _id: '5ede0ba06f76185204584700',
    clientBanner: [],
    clientRoutes: [
      '5edd91c05fcdf3111671cbf4',
    ],
    remark: '拥有完整文档操作权限(无法进入管理后台)',
    roleName: '普通用户',
    serverRoutes: [
      '5edd91b15fcdf3111671cb76',
      '60ab4dd440b59032c9227302',
      '60a7483b40b59032c9226fc3',
      '67bd4893d9884f97a42863fe',
      '67bd4893d9884f97a42261ff',
      '67bd4893d9884f97a42861ff',
      '67bd4893d9884f97a42869ff',
      '67bd4893d9884f97a42862ff',
      '67bd4893d9884f97a42863ff',
      '67bd4893d9884f97a42864ff',
      '67bd4893d9884f97a42865ff',
      '67bd4893d9884f97a42866ff',
      '67bd4893d9884f97a42867ff',
      '5f1e44e93e2abf46ec9956e3',
      '64f499d55495280730b3df8f',
      '603c8d7c1a326e4d089f99b3',
      '6056ca3ec8731d1cd490e95d',
      '605844fa5de62017b64ec29b',
      '60a35a7de7af1332c8669d60',
      '64e1d43690009434b395eecf',
      '64e1d43690009434b395eeef',
      '64e1d47d62cd860d73bdebfc',
      '64e1d530636bd4b5b317cb79',
      '64e1813e2cdf348b21007947',
      '64e1815e4e2b7265936e2f2b',
      '64e1819072bd12f578811ed5',
      '64e181bb72bd12f578811eeb',
      '64e181d972bd12f578811f01',
      '603b9a9cc953e62b80e42e12',
      '64e17ccb3131ab254994cba2',
      '64e17d7f969c4db3367cff4f',
      '64e17dc611d757b112efc1e6',
      '64d3a7b9a9647387b308467c',
      '64cefefc162e81c50c5b497f',
      '64aa7489a9cd132a77e81f5b',
      '64aa74cd0e3aa9f43b7f9675',
      '64aa74f80e3aa9f43b7f9684',
      '64aa751a0e3aa9f43b7f9693',
      '64aa755c935ddf872a6d43e4',
      '64a8f5a40558e0ba613f3cb0',
      '64a8f5a40558e0ba613f3cb1',
      '64a8ee811f0b581286ed8189',
      '60a35ac840b59032c9225c40',
      '60a5c271e7af1332c866a57e',
      '60a35a65e7af1332c8669d5f',
      '5ff17a0defe2a82db087c9ea',
      '5ff1792c972b5a29804e1ac3',
      '5ff166479c0b4737b81ee490',
      '5edd91af5fcdf3111671cb15',
      '5edd91af5fcdf3111671cb17',
      '5edd91af5fcdf3111671cb19',
      '5edd91af5fcdf3111671cb1b',
      '67f0a9b1c2d3e4f5a6b7c8d9',
      '67f0a9b1c2d3e4f5a6b7c8da',
      '5edd91af5fcdf3111671cb1d',
      '5edd91af5fcdf3111671cb1f',
      '5edd91af5fcdf3111671cb21',
      '5edd91af5fcdf3111671cb23',
      '5edd91af5fcdf3111671cb25',
      '5edd91af5fcdf3111671cb27',
      '5edd91af5fcdf3111671cb29',
      '5edd91af5fcdf3111671cb2b',
      '5edd91af5fcdf3111671cb2d',
      '5edd91af5fcdf3111671cb2f',
      '5edd91af5fcdf3111671cb31',
      '5edd91af5fcdf3111671cb33',
      '5edd91af5fcdf3111671cb35',
      '5edd91af5fcdf3111671cb37',
      '5edd91af5fcdf3111671cb39',
      '5edd91b05fcdf3111671cb3d',
      '5edd91b05fcdf3111671cb3f',
      '5edd91b05fcdf3111671cb41',
      '5edd91b05fcdf3111671cb43',
      '5edd91b05fcdf3111671cb45',
      '5edd91b05fcdf3111671cb47',
      '5edd91b05fcdf3111671cb55',
      '5edd91b05fcdf3111671cb57',
      '5edd91b05fcdf3111671cb59',
      '5edd91b05fcdf3111671cb5b',
      '5edd91b05fcdf3111671cb5d',
      '5edd91b05fcdf3111671cb5f',
      '5edd91b05fcdf3111671cb61',
      '5edd91b05fcdf3111671cb63',
      '5edd91b05fcdf3111671cb65',
      '5edd91b05fcdf3111671cb67',
      '5edd91b05fcdf3111671cb69',
      '5edd91b05fcdf3111671cb6b',
      '5edd91b05fcdf3111671cb6d',
      '5ef2fd16e06c4e3120525a53',
      '5f1cf705696cb02244906473',
      '5f1e44d63e2abf46ec9956e3',
      '5f1e44e93e2abf46ec9956e4',
      '5f1e44f33e2abf46ec9956e5',
      '5f1e45053e2abf46ec9956e6',
      '5f1e85a991093c38a013c312',
      '5ef085889b54825e2c9dc8d1',
      '5ef085889b54825e2c9dc8d0',
      '5f3cf70419d6a04bc0f58ccc',
      '5f4e001ba7d77849dc3928af',
      '5fade1e3b229918054fb4f90',
      '5fc6f4314d7b47a1cc2fb8d9',
      '5fc6f43e4d7b47a1cc2fb8da',
      '601f546054cf18489c4a071a',
      '601f546054cf18489c4a071b',
      '601f546054cf18489c4a071c',
      '5edd91b15fcdf3111671cb6f',
      '5edd91b15fcdf3111671cb6a',
      '5edd91b15fcdf3111671cb71',
      '5edd91b15fcdf3111671cb73',
      '5edd91b15fcdf3111671cb75',
      '5edd91b15fcdf3111671cb77',
      '5ee97f0c3c63cd01a49952e3',
      '5f4cf1ddf8a3c9267429c080',
      '5f4dc07a97fc7c39f819f4c0'
    ],
  },
  {
    _id: '5edf71f2193c7d5fa0ec9b98',
    clientBanner: ['5eddf6a821a5aa26cc316d28'],
    clientRoutes: ['5edd91c05fcdf3111671cbfa'],
    remark: '拥有完整权限',
    roleName: '管理员',
    serverRoutes: [
      '5edd91b15fcdf3111671cb76',
      '67bd4893d9884f97a42863fe',
      '67bd4893d9884f97a42261ff',
      '67bd4893d9884f97a42861ff',
      '67bd4893d9884f97a42869ff',
      '67bd4893d9884f97a42862ff',
      '67bd4893d9884f97a42863ff',
      '67bd4893d9884f97a42864ff',
      '67bd4893d9884f97a42865ff',
      '67bd4893d9884f97a42866ff',
      '67bd4893d9884f97a42867ff',
      '5f1e44e93e2abf46ec9956e3',
      '64f499d55495280730b3df8f',
      '603c8d7c1a326e4d089f99b3',
      '6056ca3ec8731d1cd490e95d',
      '605844fa5de62017b64ec29b',
      '60a35a7de7af1332c8669d60',
      '64e1d43690009434b395eecf',
      '64e1d43690009434b395eeef',
      '64e1d47d62cd860d73bdebfc',
      '64e1d530636bd4b5b317cb79',
      '64e1813e2cdf348b21007947',
      '64e1815e4e2b7265936e2f2b',
      '5edd91b15fcdf3111671cb6a',
      '64e1819072bd12f578811ed5',
      '64e181bb72bd12f578811eeb',
      '64e181d972bd12f578811f01',
      '603b9a9cc953e62b80e42e12',
      '64e17ccb3131ab254994cba2',
      '64e17d7f969c4db3367cff4f',
      '64e17dc611d757b112efc1e6',
      '64d3a7b9a9647387b308467c',
      '64cefefc162e81c50c5b497f',
      '64aa7489a9cd132a77e81f5b',
      '64aa74cd0e3aa9f43b7f9675',
      '64aa74f80e3aa9f43b7f9684',
      '64aa751a0e3aa9f43b7f9693',
      '64aa755c935ddf872a6d43e4',
      '64a8f5a40558e0ba613f3cb0',
      '64a8f5a40558e0ba613f3cb1',
      '64a8ee811f0b581286ed8189',
      '60a35ac840b59032c9225c40',
      '60a5c271e7af1332c866a57e',
      '60a35a65e7af1332c8669d5f',
      '5ff17a0defe2a82db087c9ea',
      '5ff1792c972b5a29804e1ac3',
      '5ff166479c0b4737b81ee490',
      '5edd91af5fcdf3111671cb15',
      '5edd91af5fcdf3111671cb17',
      '5edd91af5fcdf3111671cb19',
      '5edd91af5fcdf3111671cb1b',
      '67f0a9b1c2d3e4f5a6b7c8d9',
      '67f0a9b1c2d3e4f5a6b7c8da',
      '5edd91af5fcdf3111671cb1d',
      '5edd91af5fcdf3111671cb1f',
      '5edd91af5fcdf3111671cb21',
      '5edd91af5fcdf3111671cb23',
      '5edd91af5fcdf3111671cb25',
      '5edd91af5fcdf3111671cb27',
      '5edd91af5fcdf3111671cb29',
      '5edd91af5fcdf3111671cb2b',
      '5edd91af5fcdf3111671cb2d',
      '5edd91af5fcdf3111671cb2f',
      '5edd91af5fcdf3111671cb31',
      '5edd91af5fcdf3111671cb33',
      '5edd91af5fcdf3111671cb35',
      '5edd91af5fcdf3111671cb37',
      '5edd91af5fcdf3111671cb39',
      '5edd91b05fcdf3111671cb3d',
      '5edd91b05fcdf3111671cb3f',
      '5edd91b05fcdf3111671cb41',
      '5edd91b05fcdf3111671cb43',
      '5edd91b05fcdf3111671cb45',
      '5edd91b05fcdf3111671cb47',
      '5edd91b05fcdf3111671cb55',
      '5edd91b05fcdf3111671cb57',
      '5edd91b05fcdf3111671cb59',
      '5edd91b05fcdf3111671cb5b',
      '5edd91b05fcdf3111671cb5d',
      '5edd91b05fcdf3111671cb5f',
      '5edd91b05fcdf3111671cb61',
      '5edd91b05fcdf3111671cb63',
      '5edd91b05fcdf3111671cb65',
      '5edd91b05fcdf3111671cb67',
      '5edd91b05fcdf3111671cb69',
      '5edd91b05fcdf3111671cb6b',
      '5edd91b05fcdf3111671cb6d',
      '5ef2fd16e06c4e3120525a53',
      '5f1cf705696cb02244906473',
      '5f1e44d63e2abf46ec9956e3',
      '5f1e44e93e2abf46ec9956e4',
      '5f1e44f33e2abf46ec9956e5',
      '5f1e45053e2abf46ec9956e6',
      '5f1e85a991093c38a013c312',
      '5ef085889b54825e2c9dc8d1',
      '5ef085889b54825e2c9dc8d0',
      '5f3cf70419d6a04bc0f58ccc',
      '5f4e001ba7d77849dc3928af',
      '5fade1e3b229918054fb4f90',
      '5fc6f4314d7b47a1cc2fb8d9',
      '5fc6f43e4d7b47a1cc2fb8da',
      '601f546054cf18489c4a071a',
      '601f546054cf18489c4a071b',
      '601f546054cf18489c4a071c',
      '5edd91b15fcdf3111671cb6f',
      '5edd91b15fcdf3111671cb71',
      '5edd91b15fcdf3111671cb73',
      '5edd91b15fcdf3111671cb75',
      '5edd91b15fcdf3111671cb77',
      '5ee97f0c3c63cd01a49952e3',
      '5f4cf1ddf8a3c9267429c080',
      '5f4dc07a97fc7c39f819f4c0',
      '5edd91b25fcdf3111671cba5',
      '5edd91b25fcdf3111671cba7',
      '5edd91b25fcdf3111671cba9',
      '5edd91b25fcdf3111671cbab',
      '5edd91b25fcdf3111671cbad',
      '5edd91b25fcdf3111671cbaf',
      '5edd91b15fcdf3111671cb9b',
      '5edd91b15fcdf3111671cb9d',
      '5edd91b15fcdf3111671cb9f',
      '5edd91b15fcdf3111671cba1',
      '5edd91b25fcdf3111671cba3',
      '5edd91b15fcdf3111671cb79',
      '60a35ac840b59032c9225c41',
      '5edd91b15fcdf3111671cb7b',
      '5edd91b15fcdf3111671cb7d',
      '5edd91b15fcdf3111671cb7f',
      '5edd91b15fcdf3111671cb81',
      '5edd91b15fcdf3111671cb83',
      '5edd91b15fcdf3111671cb85',
      '5edd91b15fcdf3111671cb87',
      '5edd91b15fcdf3111671cb89',
      '5edd91b15fcdf3111671cb8b',
      '5edd91b15fcdf3111671cb8f',
      '5edd91b15fcdf3111671cb91',
      '5edd91b15fcdf3111671cb93',
      '5edd91b15fcdf3111671cb95',
      '5edd91b15fcdf3111671cb97',
      '5edd91b15fcdf3111671cb99',
      '5ee7623c1481a140fc10f67f',
      '5ee9a3ecf4365169e46c0b20',
      '5f29180adff3fd0f6823d633',
      '5f2a059ccf1a4a45bcb09282'
    ],
  },
];
const INITIAL_CLIENT_MENUS = [
  {
    _id: '5eddf6a821a5aa26cc316d28',
    name: '权限管理',
    path: '/admin',
    pid: '',
    sort: '1591603491200',
    type: 'inline',
  },
];
/*
|--------------------------------------------------------------------------
| 初始化逻辑
|--------------------------------------------------------------------------
*/
/**
 * 初始化用户信息
 */
export async function initUser(userModel: ReturnModelType<typeof User>) {
  const userInfo = await userModel.findOne();
  if (!userInfo) {
    await userModel.insertMany(INITIAL_USER);
  }
  return;
}

/**
 * 初始化后端路由信息
 */
export async function initServerRoutes(
  serverRoutesModel: ReturnModelType<typeof ServerRoutes>
) {
  const serverRoutesInfo = await serverRoutesModel.findOne();
  if (!serverRoutesInfo) {
    await serverRoutesModel.insertMany(INITIAL_SERVER_ROUTES);
  } else {
    const existingRoutes = await serverRoutesModel.find({}, { path: 1, method: 1 }).lean();
    const existingKey = new Set(existingRoutes.map(r => `${r.method}:${r.path}`));
    const missingRoutes = INITIAL_SERVER_ROUTES.filter(r => !existingKey.has(`${r.method}:${r.path}`));
    if (missingRoutes.length > 0) {
      await serverRoutesModel.insertMany(missingRoutes);
    }
  }
  return;
}

/**
 * 初始化前端路由信息
 */
export async function initClientRoutes(
  clientRoutesModel: ReturnModelType<typeof ClientRoutes>
) {
  const serverRoutesInfo = await clientRoutesModel.findOne();
  if (!serverRoutesInfo) {
    await clientRoutesModel.insertMany(INITIAL_CLIENT_ROUTES);
  }
  return;
}

/**
 * 初始化角色信息
 */
export async function initRoles(roleModel: ReturnModelType<typeof Role>) {      
  const roleInfo = await roleModel.findOne();
  if (!roleInfo) {
    await roleModel.insertMany(INITIAL_ROLE);
  } else {
    const projectRecycleRouteIds = [
      '67f0a9b1c2d3e4f5a6b7c8d9',
      '67f0a9b1c2d3e4f5a6b7c8da',
    ];
    await roleModel.updateOne(
      { _id: '5ede0ba06f76185204584700' },
      { $addToSet: { serverRoutes: { $each: projectRecycleRouteIds } } }
    );
    await roleModel.updateOne(
      { _id: '5edf71f2193c7d5fa0ec9b98' },
      { $addToSet: { serverRoutes: { $each: projectRecycleRouteIds } } }
    );
  }
  return;
}

/**
 * 初始化前端菜单
 */
export async function initClientMenus(clientMenuModel: ReturnModelType<typeof ClientMenu>) {
  const clientMenuInfo = await clientMenuModel.findOne();
  if (!clientMenuInfo) {
    await clientMenuModel.insertMany(INITIAL_CLIENT_MENUS);
  }
  return;
}

/**
 * 初始化附件信息
 */
export async function initAttachment(attachmentModel: ReturnModelType<typeof Attachment>) {
  const attachmentInfo = await attachmentModel.findOne();
  if (!attachmentInfo) {
    // await attachmentModel.insertMany([]);
  }
  return;
}
