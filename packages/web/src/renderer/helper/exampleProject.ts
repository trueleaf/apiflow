import { nanoid } from 'nanoid/non-secure'
import type { HttpNode, HttpMockNode, WebSocketMockNode } from '@src/types'
import { generateEmptyProject, generateEmptyHttpNode, generateEmptyHttpMockNode, generateEmptyWebSocketMockNode, generateEmptyProperty } from './index'
import { projectCache } from '@/cache/project/projectCache'
import { apiNodesCache } from '@/cache/nodes/nodesCache'
import { i18n } from '@/i18n'

const { t } = i18n.global

// 创建示例项目
export const createExampleProject = async (): Promise<string> => {
  const projectId = nanoid()
  const project = generateEmptyProject(projectId)
  project.projectName = t('exampleProject.name')
  project.remark = t('exampleProject.description')
  project.updatedAt = new Date().toISOString()
  
  await projectCache.addProject(project)
  
  const realApiFolder = createRealApiFolder(projectId)
  const mockFolder = createMockFolder(projectId)
  
  const realApiChildren = createRealApiChildren(projectId, realApiFolder._id)
  const mockChildren = createMockChildren(projectId, mockFolder._id)
  
  const allNodes = [realApiFolder, ...realApiChildren, mockFolder, ...mockChildren]
  
  for (const node of allNodes) {
    await apiNodesCache.addNode(node)
  }
  
  return projectId
}

// 创建真实API示例文件夹
const createRealApiFolder = (projectId: string): HttpNode => {
  const folderId = nanoid()
  const folder = generateEmptyHttpNode(folderId)
  folder.projectId = projectId
  folder.pid = ''
  folder.sort = 0
  folder.info.type = 'folder'
  folder.info.name = t('exampleProject.realApiFolder')
  folder.info.description = t('exampleProject.realApiFolderDesc')
  folder.createdAt = new Date().toISOString()
  folder.updatedAt = new Date().toISOString()
  return folder
}

// 创建Mock示例文件夹
const createMockFolder = (projectId: string): HttpNode => {
  const folderId = nanoid()
  const folder = generateEmptyHttpNode(folderId)
  folder.projectId = projectId
  folder.pid = ''
  folder.sort = 1
  folder.info.type = 'folder'
  folder.info.name = t('exampleProject.mockFolder')
  folder.info.description = t('exampleProject.mockFolderDesc')
  folder.createdAt = new Date().toISOString()
  folder.updatedAt = new Date().toISOString()
  return folder
}

// 创建真实API子节点
const createRealApiChildren = (projectId: string, folderId: string): HttpNode[] => {
  const nodes: HttpNode[] = []
  
  // 1. GET 获取用户列表
  const getUserList = generateEmptyHttpNode(nanoid())
  getUserList.projectId = projectId
  getUserList.pid = folderId
  getUserList.sort = 0
  getUserList.info.name = t('exampleProject.getUserList')
  getUserList.info.description = t('exampleProject.getUserListDesc')
  getUserList.item.method = 'GET'
  getUserList.item.url.path = 'https://jsonplaceholder.typicode.com/users'
  getUserList.createdAt = new Date().toISOString()
  getUserList.updatedAt = new Date().toISOString()
  nodes.push(getUserList)
  
  // 2. GET 获取用户详情
  const getUserDetail = generateEmptyHttpNode(nanoid())
  getUserDetail.projectId = projectId
  getUserDetail.pid = folderId
  getUserDetail.sort = 1
  getUserDetail.info.name = t('exampleProject.getUserDetail')
  getUserDetail.info.description = t('exampleProject.getUserDetailDesc')
  getUserDetail.item.method = 'GET'
  getUserDetail.item.url.path = 'https://jsonplaceholder.typicode.com/users/1'
  getUserDetail.createdAt = new Date().toISOString()
  getUserDetail.updatedAt = new Date().toISOString()
  nodes.push(getUserDetail)
  
  // 3. POST 创建用户
  const createUser = generateEmptyHttpNode(nanoid())
  createUser.projectId = projectId
  createUser.pid = folderId
  createUser.sort = 2
  createUser.info.name = t('exampleProject.createUser')
  createUser.info.description = t('exampleProject.createUserDesc')
  createUser.item.method = 'POST'
  createUser.item.url.path = 'https://jsonplaceholder.typicode.com/users'
  createUser.item.requestBody.mode = 'json'
  createUser.item.requestBody.rawJson = JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1-770-736-8031',
    website: 'john.example.com'
  }, null, 2)
  createUser.item.contentType = 'application/json'
  createUser.createdAt = new Date().toISOString()
  createUser.updatedAt = new Date().toISOString()
  nodes.push(createUser)
  
  // 4. PUT 更新用户
  const updateUser = generateEmptyHttpNode(nanoid())
  updateUser.projectId = projectId
  updateUser.pid = folderId
  updateUser.sort = 3
  updateUser.info.name = t('exampleProject.updateUser')
  updateUser.info.description = t('exampleProject.updateUserDesc')
  updateUser.item.method = 'PUT'
  updateUser.item.url.path = 'https://jsonplaceholder.typicode.com/users/1'
  updateUser.item.requestBody.mode = 'json'
  updateUser.item.requestBody.rawJson = JSON.stringify({
    name: 'John Smith',
    email: 'johnsmith@example.com'
  }, null, 2)
  updateUser.item.contentType = 'application/json'
  updateUser.createdAt = new Date().toISOString()
  updateUser.updatedAt = new Date().toISOString()
  nodes.push(updateUser)
  
  // 5. DELETE 删除用户
  const deleteUser = generateEmptyHttpNode(nanoid())
  deleteUser.projectId = projectId
  deleteUser.pid = folderId
  deleteUser.sort = 4
  deleteUser.info.name = t('exampleProject.deleteUser')
  deleteUser.info.description = t('exampleProject.deleteUserDesc')
  deleteUser.item.method = 'DELETE'
  deleteUser.item.url.path = 'https://jsonplaceholder.typicode.com/users/1'
  deleteUser.createdAt = new Date().toISOString()
  deleteUser.updatedAt = new Date().toISOString()
  nodes.push(deleteUser)
  
  // 6. GET 获取文章列表
  const getPostList = generateEmptyHttpNode(nanoid())
  getPostList.projectId = projectId
  getPostList.pid = folderId
  getPostList.sort = 5
  getPostList.info.name = t('exampleProject.getPostList')
  getPostList.info.description = t('exampleProject.getPostListDesc')
  getPostList.item.method = 'GET'
  getPostList.item.url.path = 'https://jsonplaceholder.typicode.com/posts'
  getPostList.item.queryParams = [
    { ...generateEmptyProperty(), key: 'userId', value: '1', select: true, description: t('exampleProject.userIdParam') }
  ]
  getPostList.createdAt = new Date().toISOString()
  getPostList.updatedAt = new Date().toISOString()
  nodes.push(getPostList)
  
  return nodes
}

// 创建Mock子节点
const createMockChildren = (projectId: string, folderId: string): (HttpMockNode | WebSocketMockNode)[] => {
  const nodes: (HttpMockNode | WebSocketMockNode)[] = []
  
  // 1. HTTP Mock示例
  const httpMock = generateEmptyHttpMockNode(nanoid())
  httpMock.projectId = projectId
  httpMock.pid = folderId
  httpMock.sort = 0
  httpMock.info.name = t('exampleProject.httpMockExample')
  httpMock.info.description = t('exampleProject.httpMockExampleDesc')
  httpMock.requestCondition.method = ['GET']
  httpMock.requestCondition.url = '/api/mock/user'
  httpMock.requestCondition.port = 4000
  httpMock.response[0].dataType = 'json'
  httpMock.response[0].jsonConfig.mode = 'fixed'
  httpMock.response[0].jsonConfig.fixedData = JSON.stringify({
    code: 200,
    message: 'success',
    data: {
      id: 1,
      name: 'Mock User',
      email: 'mock@example.com'
    }
  }, null, 2)
  httpMock.createdAt = new Date().toISOString()
  httpMock.updatedAt = new Date().toISOString()
  nodes.push(httpMock)
  
  // 2. WebSocket Mock示例
  const wsMock = generateEmptyWebSocketMockNode(nanoid())
  wsMock.projectId = projectId
  wsMock.pid = folderId
  wsMock.sort = 1
  wsMock.info.name = t('exampleProject.websocketMockExample')
  wsMock.info.description = t('exampleProject.websocketMockExampleDesc')
  wsMock.requestCondition.path = '/ws/mock/chat'
  wsMock.requestCondition.port = 4000
  wsMock.response.content = JSON.stringify({
    type: 'message',
    content: 'Hello from Mock WebSocket',
    timestamp: Date.now()
  }, null, 2)
  wsMock.createdAt = new Date().toISOString()
  wsMock.updatedAt = new Date().toISOString()
  nodes.push(wsMock)
  
  return nodes
}
