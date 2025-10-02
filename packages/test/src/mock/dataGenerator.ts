import type { User, Group, Project, Team, ProjectMember, TeamMember, UserOrGroup } from '@/types'

// 生成随机ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// 生成时间戳
const generateTimestamp = (daysAgo: number = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

// Mock 用户数据
export const generateMockUsers = (count: number = 20): User[] => {
  const firstNames = ['张', '李', '王', '赵', '陈', '刘', '杨', '黄', '吴', '周']
  const secondNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀', '英', '华']
  
  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const secondName = secondNames[Math.floor(Math.random() * secondNames.length)]
    const realName = firstName + secondName
    
    return {
      id: generateId(),
      userName: `user${index + 1}`,
      realName,
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      email: `user${index + 1}@example.com`,
      avatar: `https://ui-avatars.com/api/?name=${realName}&background=random`,
      type: 'user' as const
    }
  })
}

// Mock 组数据
export const generateMockGroups = (count: number = 8): Group[] => {
  const groupNames = [
    '前端开发组', '后端开发组', '移动端开发组', '测试组', 
    '产品组', '设计组', '运维组', '数据组'
  ]
  
  return Array.from({ length: count }, (_, index) => ({
    id: generateId(),
    groupName: groupNames[index] || `开发组${index + 1}`,
    description: `这是${groupNames[index] || `开发组${index + 1}`}的描述信息`,
    type: 'group' as const
  }))
}

// Mock 项目成员数据
export const generateMockProjectMembers = (users: User[], groups: Group[], count: number = 5): ProjectMember[] => {
  const permissions: Array<'readOnly' | 'readAndWrite' | 'admin'> = ['readOnly', 'readAndWrite', 'admin']
  const allUsersAndGroups = [
    ...users.map(user => ({ ...user, name: user.realName, type: 'user' as const })),
    ...groups.map(group => ({ ...group, name: group.groupName, type: 'group' as const }))
  ]
  
  const selectedMembers = allUsersAndGroups
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
  
  return selectedMembers.map(member => ({
    id: member.id,
    name: member.name,
    type: member.type,
    permission: permissions[Math.floor(Math.random() * permissions.length)]
  }))
}

// Mock 项目数据
export const generateMockProjects = (users: User[], groups: Group[], count: number = 15): Project[] => {
  const projectNames = [
    'API管理平台', '用户管理系统', '订单管理系统', '支付系统',
    '权限管理系统', '日志分析平台', '监控告警系统', '配置管理中心',
    '文档管理系统', '代码仓库管理', 'CI/CD平台', '数据可视化平台',
    '消息推送系统', '搜索引擎', '推荐系统'
  ]
  
  return Array.from({ length: count }, (_, index) => {
    const creator = users[Math.floor(Math.random() * users.length)]
    const daysAgo = Math.floor(Math.random() * 30)
    
    return {
      id: generateId(),
      projectName: projectNames[index] || `项目${index + 1}`,
      description: `这是${projectNames[index] || `项目${index + 1}`}的详细描述`,
      createdAt: generateTimestamp(daysAgo),
      updatedAt: generateTimestamp(Math.floor(daysAgo / 2)),
      creatorId: creator.id,
      members: generateMockProjectMembers(users, groups, Math.floor(Math.random() * 8) + 3)
    }
  })
}

// Mock 团队成员数据
export const generateMockTeamMembers = (users: User[], count: number = 5): TeamMember[] => {
  const permissions: Array<'readOnly' | 'readAndWrite' | 'admin'> = ['readOnly', 'readAndWrite', 'admin']
  
  const selectedUsers = users
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
  
  return selectedUsers.map(user => ({
    id: user.id,
    userName: user.userName,
    realName: user.realName,
    permission: permissions[Math.floor(Math.random() * permissions.length)]
  }))
}

// Mock 团队数据
export const generateMockTeams = (users: User[], count: number = 6): Team[] => {
  const teamNames = [
    '核心开发团队', 'API设计团队', '前端UI团队', 
    '后端服务团队', '测试质量团队', '产品运营团队'
  ]
  
  return Array.from({ length: count }, (_, index) => ({
    _id: generateId(),
    groupName: teamNames[index] || `团队${index + 1}`,
    description: `${teamNames[index] || `团队${index + 1}`}负责相关业务开发和维护`,
    createdAt: generateTimestamp(Math.floor(Math.random() * 60)),
    members: generateMockTeamMembers(users, Math.floor(Math.random() * 10) + 5)
  }))
}

// 生成用户或组的搜索数据
export const generateMockUserOrGroupSearch = (users: User[], groups: Group[]): UserOrGroup[] => {
  const userOrGroups: UserOrGroup[] = [
    ...users.map(user => ({
      id: user.id,
      name: user.realName,
      type: 'user' as const,
      userName: user.userName,
      realName: user.realName,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar
    })),
    ...groups.map(group => ({
      id: group.id,
      name: group.groupName,
      type: 'group' as const,
      groupName: group.groupName,
      description: group.description
    }))
  ]
  
  return userOrGroups
}

// 导出所有生成器函数
export const MockDataGenerator = {
  generateMockUsers,
  generateMockGroups,
  generateMockProjects,
  generateMockTeams,
  generateMockProjectMembers,
  generateMockTeamMembers,
  generateMockUserOrGroupSearch,
  generateId,
  generateTimestamp
}