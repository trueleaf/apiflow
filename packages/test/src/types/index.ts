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

// 测试用例接口
export interface TestCase {
  id: string
  name: string // 案例名称，如："基础创建流程"、"批量创建测试"
  description: string // 功能描述
  steps: TestStep[] // 测试步骤
  validations: ValidationItem[] // 结果验证
}

// 测试步骤接口
export interface TestStep {
  stepNumber: number
  description: string
}

// 验证项接口
export interface ValidationItem {
  description: string
  status: 'success' | 'warning' | 'error'
}

// 功能模块接口
export interface FeatureModule {
  id: string
  title: string // 模块标题，如："项目创建与编辑"
  icon: string // 图标名称
  iconColor: string // 图标颜色类
  testCases: TestCase[] // 该模块的所有测试案例
}