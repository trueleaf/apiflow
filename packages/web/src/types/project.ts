// ============================================================================
// 基础响应类型
// ============================================================================

//基础返回类型
export type Response<T> = {
  /**
   * 状态码
   */
  code: number;
  /**
   * 登录名称
   */
  msg: string;
  /**
   * 返回数据
   */
  data: T;
};

//表单返回
export type ResponseTable<T> = {
  /**
   * 状态码
   */
  code: number;
  /**
   * 登录名称
   */
  msg: string;
  /**
   * 返回数据
   */
  data: {
    rows: T;
    total: number;
  };
};

// ============================================================================
// 权限相关类型
// ============================================================================

//顶部导航菜单
export type PermissionMenu = {
  name: string;
  path: string;
};

//角色枚举信息
export type PermissionRoleEnum = { _id: string; roleName: string }[];

//用户信息
export type PermissionUserInfo = {
  /**
   * 用户id
   */
  id: string;
  /**
   * 登录名称
   */
  loginName: string;
  /**
   * 手机号码
   */
  phone: string;
  /**
   * 昵称
   */
  realName: string;
  /**
   * 角色id列表
   */
  roleIds: string[];
  token: string;
};

//用户基本信息
export type PermissionUserBaseInfo = {
  /**
   * 登录名称
   */
  userName: string;
  /**
   * 昵称
   */
  realName: string;
  /**
   * 用户id
   */
  userId: string;
};

//前端路由列表
export type PermissionClientRoute = {
  /**
   * 分组名称
   */
  groupName: string;
  /**
   * 路由名称
   */
  name: string;
  /**
   * 路径
   */
  path: string;
  /**
   * 路由id
   */
  _id: string;
};

//后端路由列表
export type PermissionServerRoute = {
  /**
   * 分组名称
   */
  groupName: string;
  /**
   * 路由名称
   */
  name: string;
  /**
   * 路径
   */
  path: string;
  /**
   * 路由id
   */
  _id: string;
};

//客户端菜单
export type PermissionClientMenu = {
  id?: string;
  /**
   * 菜单id
   */
  _id: string;
  /**
   * 菜单名称
   */
  name: string;
  /**
   * 菜单路径
   */
  path: string;
  /**
   * 菜单父元素id
   */
  pid: string;
  /**
   * 菜单排序
   */
  sort: number;
  /**
   * 菜单类型，inline:内联菜单  link:外链跳转
   */
  type: 'inline' | 'link';
  /**
   * 子菜单
   */
  children: PermissionClientMenu[] | [];
};

// ============================================================================
// 项目相关类型
// ============================================================================

//项目枚举信息
export type ApidocProjectEnum = {
  projectName: string;
  _id: string;
};

//项目权限枚举
export type ApidocProjectPermission = 'readAndWrite' | 'readOnly' | 'admin';

//项目成员基本信息
export type ApidocProjectMemberInfo = {
  /**
   * 用户或组名称
   */
  name: string;
  /**
   * 用户权限 "readAndWrite" | "readOnly" | "admin"
   */
  permission?: ApidocProjectPermission;
  /**
   * 类型
   */
  type: "user" | "group",
  /**
   * 用户或组id
   */
  id: string;
};

//项目成员基本信息
export type ApidocProjectInfo = {
  /**
   * 项目id
   */
  _id: string;
  /**
   * 项目接口数量
   */
  docNum: number;
  /**
   * 项目创建者
   */
  owner: {
    id: string;
    name: string;
  };
  /**
   * 项目成员信息
   */
  members: ApidocProjectMemberInfo[];
  /**
   * 项目名称
   */
  projectName: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 最近一次更新日期
   */
  updatedAt: string;
  /**
   * 是否被收藏
   */
  isStared: boolean;
  /**
   * 是否被删除
   */
  isDeleted: boolean;
};

//项目列表信息
export type ApidocProjectListInfo = {
  /**
   * 项目列表
   */
  list: ApidocProjectInfo[];
  /**
   * 最近访问项目ids
   */
  recentVisitProjects: string[];
  /**
   * 用户star的项目ids
   */
  starProjects: string[];
};

// ============================================================================
// 组管理相关类型
// ============================================================================

//组成员信息
export type ApidocGroupUser = {
  /**
   * 用户名称
   */
  userName: string;
  /**
   * 用户id
   */
  userId: string;
  /**
   * 权限
   */
  permission: "admin" | "readOnly" | "readAndWrite",
  /**
   * 过期时间
   */
  expireAt?: string;
}

//组信息
export type ApidocGroupItem = {
  /**
   * 组id
   */
  _id: string;
  /**
   * 组名称
   */
  groupName: string;
  /**
   * 组描述
   */
  description: string;
  /**
   * 创建者
   */
  creator: {
    userId: string;
    userName: string;
    _id: string;
  },
  /**
   * 更新者
   */
  updator: {
    userId: string;
    userName: string;
    _id: string;
  },
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 更新时间
   */
  updatedAt: string;
  /**
   * 成员列表
   */
  members: ApidocGroupUser[];
  /**
   * 是否允许邀请
   */
  isAllowInvite: boolean;
}

// ============================================================================
// 全局配置相关类型
// ============================================================================

//全局配置信息
export type GlobalConfig = {
  /**
   * 工具标题
   */
  title: string;
  /**
   * 版本信息
   */
  version: string;
  /**
   * 是否打印欢迎信息
   */
  consoleWelcome: boolean;
  /**
   * 是否允许用户注册
   */
  enableRegister: boolean;
  /**
   * 是否允许来宾用户访问
   */
  enableGuest: boolean;
  /**
   * 是否允许显示文档链接
   */
  enableDocLink: boolean;
  /**
   * 分享url
   */
  shareUrl: string;
  /**
   * 是否开启自动更新
   */
  autoUpdate: boolean;
  /**
   * 客户端更新地址
   */
  updateUrl: string;
};


