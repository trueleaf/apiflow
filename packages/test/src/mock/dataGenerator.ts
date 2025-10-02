import type { User, Group, Project, Team, ProjectMember, TeamMember, UserOrGroup, FeatureModule, TestCase, TestStep, ValidationItem } from '@/types'

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

// 生成功能模块的测试数据
export const generateFeatureModules = (): FeatureModule[] => {
  return [
    {
      id: 'module-1',
      title: '项目创建与编辑',
      icon: 'DocumentAdd',
      iconColor: 'blue',
      testCases: [
        {
          id: 'case-1-1',
          name: '基础创建流程',
          description: '支持用户创建新的API文档项目并管理项目基本信息。用户可以通过"新建项目"按钮快速创建项目，填写项目名称和描述信息。创建完成后，支持编辑项目的基本信息和配置，确保项目信息的实时更新和自动保存。',
          steps: [
            { stepNumber: 1, description: '点击页面右上角的"新建项目"按钮' },
            { stepNumber: 2, description: '在弹出的对话框中填写项目名称（如："测试API项目"）' },
            { stepNumber: 3, description: '输入项目描述信息（如："这是一个用于演示的API文档项目"）' },
            { stepNumber: 4, description: '点击"确认"按钮提交创建' },
            { stepNumber: 5, description: '在项目卡片上点击"更多"按钮，选择"编辑"选项' },
            { stepNumber: 6, description: '修改项目名称或描述信息，点击"保存"按钮' }
          ],
          validations: [
            { description: '项目创建成功后，页面返回到项目列表，新创建的项目显示在列表顶部', status: 'success' },
            { description: '项目卡片正确显示项目名称、描述、创建时间等基本信息', status: 'success' },
            { description: '编辑功能正常，修改的信息能实时保存并在列表中更新显示', status: 'success' },
            { description: '表单验证生效，重复的项目名称会提示错误信息', status: 'success' }
          ]
        },
        {
          id: 'case-1-2',
          name: '批量创建测试',
          description: '测试系统在短时间内创建多个项目的能力，验证项目创建的性能和稳定性。包括测试并发创建、连续创建场景，确保系统能够正确处理大量项目创建请求。',
          steps: [
            { stepNumber: 1, description: '点击"新建项目"按钮' },
            { stepNumber: 2, description: '填写第一个项目信息："批量测试项目1"' },
            { stepNumber: 3, description: '快速提交并再次打开创建对话框' },
            { stepNumber: 4, description: '继续创建项目2-5，每个项目名称递增' },
            { stepNumber: 5, description: '观察系统响应速度和创建结果' }
          ],
          validations: [
            { description: '系统能够快速响应多次创建请求，无明显延迟', status: 'success' },
            { description: '所有创建的项目都正确显示在列表中', status: 'success' },
            { description: '项目创建顺序正确，最新的在最上方', status: 'success' },
            { description: '没有出现项目ID冲突或数据丢失的情况', status: 'success' }
          ]
        },
        {
          id: 'case-1-3',
          name: '表单验证测试',
          description: '验证项目创建表单的各项验证规则，包括必填项验证、字符长度限制、特殊字符处理等。确保表单验证机制能够有效防止非法数据提交。',
          steps: [
            { stepNumber: 1, description: '点击"新建项目"按钮打开创建对话框' },
            { stepNumber: 2, description: '不填写任何内容，直接点击"确认"按钮' },
            { stepNumber: 3, description: '观察必填项提示信息' },
            { stepNumber: 4, description: '输入超长项目名称（超过50个字符）' },
            { stepNumber: 5, description: '输入包含特殊字符的项目名称，如：<script>test</script>' },
            { stepNumber: 6, description: '输入已存在的项目名称' }
          ],
          validations: [
            { description: '未填写必填项时，显示明确的错误提示', status: 'success' },
            { description: '项目名称超长时，提示字符长度限制', status: 'success' },
            { description: '特殊字符被正确转义或过滤，防止XSS攻击', status: 'success' },
            { description: '重复项目名称被拦截，提示名称已存在', status: 'success' }
          ]
        }
      ]
    },
    {
      id: 'module-2',
      title: '智能搜索系统',
      icon: 'Search',
      iconColor: 'green',
      testCases: [
        {
          id: 'case-2-1',
          name: '基础搜索功能',
          description: '提供基础搜索模式，帮助用户快速定位目标项目。基础搜索支持按项目名称进行模糊匹配，实时展示搜索结果无需手动触发，一键清空搜索条件快速重置。',
          steps: [
            { stepNumber: 1, description: '在页面顶部的搜索框中输入项目名称关键词（如："API"）' },
            { stepNumber: 2, description: '观察项目列表实时过滤，只显示匹配的项目' },
            { stepNumber: 3, description: '点击搜索框的清空按钮，验证列表恢复显示全部项目' }
          ],
          validations: [
            { description: '基础搜索支持模糊匹配，输入部分关键词即可找到相关项目', status: 'success' },
            { description: '搜索结果实时更新，无需按回车或点击搜索按钮', status: 'success' },
            { description: '清空搜索条件后，列表正确恢复显示所有项目', status: 'success' }
          ]
        },
        {
          id: 'case-2-2',
          name: '高级搜索功能',
          description: '高级搜索支持接口URL精确查询，可组合多个搜索条件提高查找精度，系统自动记录搜索历史并提供智能搜索建议。',
          steps: [
            { stepNumber: 1, description: '点击搜索框右侧的"工具"图标打开高级搜索' },
            { stepNumber: 2, description: '在高级搜索框输入接口URL关键词（如："/api/user"）' },
            { stepNumber: 3, description: '点击"搜索"按钮，验证搜索结果的准确性' }
          ],
          validations: [
            { description: '高级搜索支持URL精确匹配，搜索结果准确无误', status: 'success' },
            { description: '搜索历史被正确记录，下次打开时可以快速选择', status: 'success' },
            { description: '搜索建议功能有效，能够智能推荐相关搜索词', status: 'success' }
          ]
        }
      ]
    },
    {
      id: 'module-3',
      title: '项目收藏管理',
      icon: 'Star',
      iconColor: 'yellow',
      testCases: [
        {
          id: 'case-3-1',
          name: '收藏与取消收藏',
          description: '允许用户一键收藏或取消收藏重要项目，收藏的项目会在独立区域展示，方便快速访问常用项目。收藏状态支持实时同步，确保多端数据一致性。',
          steps: [
            { stepNumber: 1, description: '在项目卡片右上角找到星形收藏图标' },
            { stepNumber: 2, description: '点击星形图标，图标变为金色表示已收藏' },
            { stepNumber: 3, description: '观察项目自动移动到"收藏的项目"区域' },
            { stepNumber: 4, description: '再次点击金色星形图标取消收藏' },
            { stepNumber: 5, description: '验证项目从"收藏的项目"区域移除' }
          ],
          validations: [
            { description: '点击星形图标后，收藏状态立即更新，图标颜色变化明显', status: 'success' },
            { description: '收藏的项目正确显示在"收藏的项目"独立区域', status: 'success' },
            { description: '取消收藏后，项目从收藏区域移除，返回全部项目列表', status: 'success' }
          ]
        },
        {
          id: 'case-3-2',
          name: '收藏排序测试',
          description: '测试收藏项目的排序功能，确保最常用的项目显示在前面。验证系统按最近使用时间自动排序的准确性。',
          steps: [
            { stepNumber: 1, description: '收藏多个项目（至少5个）' },
            { stepNumber: 2, description: '观察"收藏的项目"区域的项目排序' },
            { stepNumber: 3, description: '点击访问其中某个较后的项目' },
            { stepNumber: 4, description: '返回项目列表，观察该项目是否移到前面' }
          ],
          validations: [
            { description: '收藏项目按最近使用时间自动排序，顺序正确', status: 'success' },
            { description: '访问项目后，该项目自动移动到收藏列表顶部', status: 'success' },
            { description: '排序逻辑稳定，没有出现频繁跳动的情况', status: 'success' }
          ]
        }
      ]
    },
    {
      id: 'module-4',
      title: '权限控制系统',
      icon: 'UserFilled',
      iconColor: 'red',
      testCases: [
        {
          id: 'case-4-1',
          name: '成员添加与权限分配',
          description: '提供完善的团队协作和权限管理功能。支持邀请团队成员加入项目协作，展示成员头像和基本信息，并统计成员活跃度和贡献度。',
          steps: [
            { stepNumber: 1, description: '点击项目卡片的"更多"按钮，选择"权限管理"' },
            { stepNumber: 2, description: '在权限管理页面点击"添加成员"按钮' },
            { stepNumber: 3, description: '输入用户邮箱或用户名进行成员搜索' },
            { stepNumber: 4, description: '为新成员选择权限级别：只读/可编辑/管理员' },
            { stepNumber: 5, description: '点击"确认"完成成员添加' }
          ],
          validations: [
            { description: '成员添加成功，成员列表正确显示新成员信息和头像', status: 'success' },
            { description: '不同权限级别的成员看到的操作按钮不同，权限控制生效', status: 'success' },
            { description: '只读权限成员无法编辑项目，只能查看内容', status: 'success' }
          ]
        },
        {
          id: 'case-4-2',
          name: '权限变更审计',
          description: '系统自动记录所有权限变更日志，支持审计功能便于追踪权限变动历史。确保权限变更的可追溯性和安全性。',
          steps: [
            { stepNumber: 1, description: '选择已有成员，测试修改其权限级别' },
            { stepNumber: 2, description: '将成员权限从"只读"改为"可编辑"' },
            { stepNumber: 3, description: '查看权限变更日志，验证操作记录' }
          ],
          validations: [
            { description: '权限变更日志完整记录操作人、操作时间和变更内容', status: 'success' },
            { description: '权限变更立即生效，成员可以看到新的操作权限', status: 'success' },
            { description: '日志记录详细，包括变更前后的权限级别对比', status: 'success' }
          ]
        }
      ]
    },
    {
      id: 'module-5',
      title: '项目列表展示',
      icon: 'List',
      iconColor: 'purple',
      testCases: [
        {
          id: 'case-5-1',
          name: '列表布局与信息展示',
          description: '采用卡片式布局展示所有项目，信息一目了然。将收藏项目和全部项目分区展示，方便用户快速找到常用项目。支持列表折叠/展开功能，节省页面空间。',
          steps: [
            { stepNumber: 1, description: '打开项目管理页面，观察页面整体布局' },
            { stepNumber: 2, description: '检查"收藏的项目"和"全部项目"两个区域的展示' },
            { stepNumber: 3, description: '点击区域标题旁的折叠/展开按钮，测试折叠功能' },
            { stepNumber: 4, description: '查看项目卡片上显示的项目名称、描述和更新时间' }
          ],
          validations: [
            { description: '卡片布局整齐美观，所有项目信息清晰可见', status: 'success' },
            { description: '收藏项目和全部项目正确分区显示，互不干扰', status: 'success' },
            { description: '折叠/展开功能正常工作，动画流畅自然', status: 'success' }
          ]
        },
        {
          id: 'case-5-2',
          name: '卡片统计信息',
          description: '每个项目卡片展示丰富的统计信息，包括接口数量、成员数量等关键指标，帮助用户快速了解项目规模。',
          steps: [
            { stepNumber: 1, description: '观察项目卡片底部的统计区域' },
            { stepNumber: 2, description: '验证卡片底部的统计信息：接口数量和成员数量' },
            { stepNumber: 3, description: '点击进入项目详情，对比统计数据的准确性' }
          ],
          validations: [
            { description: '项目统计数据准确，与实际接口和成员数量一致', status: 'success' },
            { description: '统计信息显示清晰，数字易读', status: 'success' },
            { description: '卡片悬停时有适当的交互效果提示', status: 'success' }
          ]
        }
      ]
    },
    {
      id: 'module-6',
      title: '批量操作管理',
      icon: 'Operation',
      iconColor: 'indigo',
      testCases: [
        {
          id: 'case-6-1',
          name: '批量选择与操作',
          description: '支持多项目选择和批量操作功能，提高工作效率。用户可以同时选择多个项目进行批量删除、批量导出项目数据和配置、批量权限设置和成员管理等操作。',
          steps: [
            { stepNumber: 1, description: '在项目列表中，勾选多个项目的复选框' },
            { stepNumber: 2, description: '观察页面顶部出现批量操作工具栏' },
            { stepNumber: 3, description: '点击"批量导出"按钮，验证数据导出功能' }
          ],
          validations: [
            { description: '多选功能正常，选中的项目高亮显示，选中数量正确统计', status: 'success' },
            { description: '批量导出成功生成文件，文件包含所有选中项目的完整数据', status: 'success' },
            { description: '批量操作工具栏显示清晰，操作按钮布局合理', status: 'success' }
          ]
        },
        {
          id: 'case-6-2',
          name: '批量删除安全机制',
          description: '系统提供完善的安全机制，包括删除确认弹窗防止误操作、操作日志记录便于追溯历史、数据备份和恢复功能确保数据安全。',
          steps: [
            { stepNumber: 1, description: '选择测试项目，点击"批量删除"按钮' },
            { stepNumber: 2, description: '在确认对话框中仔细阅读警告信息' },
            { stepNumber: 3, description: '输入确认信息后点击"确认删除"' },
            { stepNumber: 4, description: '查看操作日志，验证批量操作记录' }
          ],
          validations: [
            { description: '批量删除前有明确的确认提示，防止误操作', status: 'success' },
            { description: '操作日志完整记录批量操作的时间、操作人和影响的项目列表', status: 'success' },
            { description: '删除操作可以撤销，或有数据恢复机制', status: 'warning' }
          ]
        }
      ]
    }
  ]
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
  generateFeatureModules,
  generateId,
  generateTimestamp
}