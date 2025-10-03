export interface User {
  id: string
  userName: string
  realName: string
  phone?: string
  email?: string
  avatar?: string
  type: 'user'
}

export interface Group {
  id: string
  groupName: string
  description?: string
  type: 'group'
}

export interface UserOrGroup {
  id: string
  name: string
  type: 'user' | 'group'
  // User specific fields
  userName?: string
  realName?: string
  phone?: string
  email?: string
  avatar?: string
  // Group specific fields
  groupName?: string
  description?: string
}

export interface Project {
  id: string
  projectName: string
  description?: string
  createdAt: string
  updatedAt: string
  creatorId: string
  members: ProjectMember[]
}

export interface ProjectMember {
  id: string
  name: string
  type: 'user' | 'group'
  permission: 'readOnly' | 'readAndWrite' | 'admin'
}

export interface Team {
  _id: string
  groupName: string
  description?: string
  createdAt: string
  members: TeamMember[]
}

export interface TeamMember {
  id: string
  userName: string
  realName: string
  permission: 'readOnly' | 'readAndWrite' | 'admin'
}

export type Permission = 'readOnly' | 'readAndWrite' | 'admin'
export type UserType = 'user' | 'group'

// 测试案例状态
export type TestStatus = 'pending' | 'passed' | 'failed'

// 测试用例接口
export interface TestCase {
  id: string
  name: string // 用例名称
  steps: {
    description: string
    expectedResult: string // 每一步的预期结果
  }[] // 测试步骤
  results: {
    description: string // 实际执行结果
  }[]
  status: TestStatus // 执行状态
  executedAt: string // 执行时间
  executedBy: string // 执行人
  remark?: string // 备注（失败时填写）
  images?: string[] // 图片数组（base64格式）
}

// 测试模块接口
export interface TestModule {
  id: string
  name: string // 模块名称
  testCases: TestCase[] // 该模块下的所有测试用例
}

// 模块树节点接口
export interface ModuleTreeNode {
  id: string
  label: string
  children?: ModuleTreeNode[]
  moduleId?: string // 对应的功能模块ID
}

// 模块统计数据接口
export interface ModuleStatistics {
  id: string // 模块ID（moduleId 或 节点ID）
  name: string // 模块名称
  level: 'parent' | 'leaf' // 层级：父节点或叶子节点
  total: number // 用例总数
  passed: number // 成功数量
  failed: number // 失败数量
  pending: number // 未执行数量
}