import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockApi } from '@/mock/api'

export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const loading = ref(false)
  
  // Actions
  const updateProjectMemberPermission = async (
    projectId: string, 
    memberId: string, 
    permission: string
  ) => {
    loading.value = true
    try {
      const response = await mockApi.permission.updateProjectMemberPermission(
        projectId, 
        memberId, 
        permission
      )
      return response
    } catch (error) {
      console.error('更新成员权限失败:', error)
      return { success: false, message: '更新权限失败' }
    } finally {
      loading.value = false
    }
  }
  
  const addProjectMember = async (
    projectId: string,
    member: { id: string; name: string; type: 'user' | 'group'; permission: string }
  ) => {
    loading.value = true
    try {
      const response = await mockApi.permission.addProjectMember(projectId, member)
      return response
    } catch (error) {
      console.error('添加项目成员失败:', error)
      return { success: false, message: '添加成员失败' }
    } finally {
      loading.value = false
    }
  }
  
  const removeProjectMember = async (projectId: string, memberId: string) => {
    loading.value = true
    try {
      const response = await mockApi.permission.removeProjectMember(projectId, memberId)
      return response
    } catch (error) {
      console.error('移除项目成员失败:', error)
      return { success: false, message: '移除成员失败' }
    } finally {
      loading.value = false
    }
  }
  
  // 权限标签映射
  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      readOnly: '只读',
      readAndWrite: '读写',
      admin: '管理员'
    }
    return labels[permission] || permission
  }
  
  const getPermissionDescription = (permission: string) => {
    const descriptions: Record<string, string> = {
      readOnly: '仅查看项目',
      readAndWrite: '新增和编辑文档',
      admin: '添加新成员'
    }
    return descriptions[permission] || ''
  }
  
  return {
    // 状态
    loading,
    
    // Actions
    updateProjectMemberPermission,
    addProjectMember,
    removeProjectMember,
    
    // 工具函数
    getPermissionLabel,
    getPermissionDescription
  }
})