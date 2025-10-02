import { MockDataGenerator } from './dataGenerator'
import type { User, Group, Project, Team, UserOrGroup } from '@/types'

// 模拟异步延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 初始化数据
let mockUsers: User[] = []
let mockGroups: Group[] = []
let mockProjects: Project[] = []
let mockTeams: Team[] = []
let mockUserOrGroups: UserOrGroup[] = []

// 初始化所有 Mock 数据
export const initializeMockData = () => {
  mockUsers = MockDataGenerator.generateMockUsers(25)
  mockGroups = MockDataGenerator.generateMockGroups(8)
  mockProjects = MockDataGenerator.generateMockProjects(mockUsers, mockGroups, 20)
  mockTeams = MockDataGenerator.generateMockTeams(mockUsers, 8)
  mockUserOrGroups = MockDataGenerator.generateMockUserOrGroupSearch(mockUsers, mockGroups)
  
  console.log('Mock 数据初始化完成:', {
    users: mockUsers.length,
    groups: mockGroups.length,
    projects: mockProjects.length,
    teams: mockTeams.length,
    searchData: mockUserOrGroups.length
  })
}

// 项目相关 API
export const projectApi = {
  // 获取项目列表
  async getProjects(params?: {
    projectName?: string
    keyword?: string
    page?: number
    pageSize?: number
  }) {
    await delay(200)
    
    let filteredProjects = [...mockProjects]
    
    // 按项目名称过滤
    if (params?.projectName) {
      filteredProjects = filteredProjects.filter(project =>
        project.projectName.toLowerCase().includes(params.projectName!.toLowerCase())
      )
    }
    
    // 按关键词搜索（搜索项目名称和描述）
    if (params?.keyword) {
      filteredProjects = filteredProjects.filter(project =>
        project.projectName.toLowerCase().includes(params.keyword!.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(params.keyword!.toLowerCase()))
      )
    }
    
    // 分页
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      success: true,
      data: {
        list: filteredProjects.slice(start, end),
        total: filteredProjects.length,
        page,
        pageSize
      }
    }
  },
  
  // 创建项目
  async createProject(projectData: {
    projectName: string
    description?: string
    members: Array<{ id: string; name: string; type: 'user' | 'group'; permission: string }>
  }) {
    await delay(500)
    
    const newProject: Project = {
      id: MockDataGenerator.generateId(),
      projectName: projectData.projectName,
      description: projectData.description,
      createdAt: MockDataGenerator.generateTimestamp(),
      updatedAt: MockDataGenerator.generateTimestamp(),
      creatorId: mockUsers[0].id, // 模拟当前用户
      members: projectData.members.map(member => ({
        id: member.id,
        name: member.name,
        type: member.type,
        permission: member.permission as any
      }))
    }
    
    mockProjects.unshift(newProject)
    
    return {
      success: true,
      data: newProject,
      message: '项目创建成功'
    }
  },
  
  // 更新项目
  async updateProject(id: string, updates: Partial<Project>) {
    await delay(400)
    
    const index = mockProjects.findIndex(p => p.id === id)
    if (index === -1) {
      return { success: false, message: '项目不存在' }
    }
    
    mockProjects[index] = {
      ...mockProjects[index],
      ...updates,
      updatedAt: MockDataGenerator.generateTimestamp()
    }
    
    return {
      success: true,
      data: mockProjects[index],
      message: '项目更新成功'
    }
  },
  
  // 删除项目
  async deleteProject(id: string) {
    await delay(300)
    
    const index = mockProjects.findIndex(p => p.id === id)
    if (index === -1) {
      return { success: false, message: '项目不存在' }
    }
    
    mockProjects.splice(index, 1)
    
    return {
      success: true,
      message: '项目删除成功'
    }
  }
}

// 团队相关 API
export const teamApi = {
  // 获取团队列表
  async getTeams(params?: { searchText?: string }) {
    await delay(200)
    
    let filteredTeams = [...mockTeams]
    
    if (params?.searchText) {
      filteredTeams = filteredTeams.filter(team =>
        team.groupName.toLowerCase().includes(params.searchText!.toLowerCase())
      )
    }
    
    return {
      success: true,
      data: filteredTeams
    }
  },
  
  // 创建团队
  async createTeam(teamData: {
    groupName: string
    description?: string
    members: Array<{ id: string; userName: string; realName: string }>
  }) {
    await delay(500)
    
    const newTeam: Team = {
      _id: MockDataGenerator.generateId(),
      groupName: teamData.groupName,
      description: teamData.description,
      createdAt: MockDataGenerator.generateTimestamp(),
      members: teamData.members.map(member => ({
        id: member.id,
        userName: member.userName,
        realName: member.realName,
        permission: 'readAndWrite'
      }))
    }
    
    mockTeams.unshift(newTeam)
    
    return {
      success: true,
      data: newTeam,
      message: '团队创建成功'
    }
  },
  
  // 删除团队
  async deleteTeam(id: string) {
    await delay(300)
    
    const index = mockTeams.findIndex(t => t._id === id)
    if (index === -1) {
      return { success: false, message: '团队不存在' }
    }
    
    mockTeams.splice(index, 1)
    
    return {
      success: true,
      message: '团队删除成功'
    }
  }
}

// 用户/组搜索 API
export const searchApi = {
  // 搜索用户或组
  async searchUserOrGroup(query: string) {
    await delay(150)
    
    if (!query.trim()) {
      return { success: true, data: [] }
    }
    
    const results = mockUserOrGroups.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.userName && item.userName.toLowerCase().includes(query.toLowerCase())) ||
      (item.phone && item.phone.includes(query))
    ).slice(0, 10) // 限制返回结果数量
    
    return {
      success: true,
      data: results
    }
  },
  
  // 搜索用户
  async searchUsers(query: string) {
    await delay(150)
    
    if (!query.trim()) {
      return { success: true, data: [] }
    }
    
    const results = mockUsers.filter(user =>
      user.realName.toLowerCase().includes(query.toLowerCase()) ||
      user.userName.toLowerCase().includes(query.toLowerCase()) ||
      (user.phone && user.phone.includes(query))
    ).slice(0, 10)
    
    return {
      success: true,
      data: results
    }
  }
}

// 权限相关 API
export const permissionApi = {
  // 更新项目成员权限
  async updateProjectMemberPermission(projectId: string, memberId: string, permission: string) {
    await delay(200)
    
    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      return { success: false, message: '项目不存在' }
    }
    
    const member = project.members.find(m => m.id === memberId)
    if (!member) {
      return { success: false, message: '成员不存在' }
    }
    
    member.permission = permission as any
    
    return {
      success: true,
      message: '权限更新成功'
    }
  },
  
  // 添加项目成员
  async addProjectMember(projectId: string, member: { id: string; name: string; type: 'user' | 'group'; permission: string }) {
    await delay(300)
    
    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      return { success: false, message: '项目不存在' }
    }
    
    // 检查成员是否已存在
    const existingMember = project.members.find(m => m.id === member.id)
    if (existingMember) {
      return { success: false, message: '该成员已存在' }
    }
    
    project.members.push({
      id: member.id,
      name: member.name,
      type: member.type,
      permission: member.permission as any
    })
    
    return {
      success: true,
      message: '成员添加成功'
    }
  },
  
  // 移除项目成员
  async removeProjectMember(projectId: string, memberId: string) {
    await delay(200)
    
    const project = mockProjects.find(p => p.id === projectId)
    if (!project) {
      return { success: false, message: '项目不存在' }
    }
    
    const memberIndex = project.members.findIndex(m => m.id === memberId)
    if (memberIndex === -1) {
      return { success: false, message: '成员不存在' }
    }
    
    project.members.splice(memberIndex, 1)
    
    return {
      success: true,
      message: '成员移除成功'
    }
  }
}

// 导出 API
export const mockApi = {
  project: projectApi,
  team: teamApi,
  search: searchApi,
  permission: permissionApi,
  initializeMockData
}