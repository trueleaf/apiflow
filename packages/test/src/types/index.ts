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