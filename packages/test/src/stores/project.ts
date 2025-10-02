import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockApi } from '@/mock/api'
import type { Project } from '@/types'

export const useProjectStore = defineStore('project', () => {
  // 状态
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const searchLoading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  
  // 搜索条件
  const searchParams = ref({
    projectName: '',
    keyword: '',
    isAdvancedSearch: false
  })
  
  // 计算属性
  const hasProjects = computed(() => projects.value.length > 0)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  
  // Actions
  const fetchProjects = async (params?: {
    projectName?: string
    keyword?: string
    page?: number
    pageSize?: number
  }) => {
    loading.value = true
    try {
      const response = await mockApi.project.getProjects({
        projectName: params?.projectName || searchParams.value.projectName,
        keyword: params?.keyword || searchParams.value.keyword,
        page: params?.page || currentPage.value,
        pageSize: params?.pageSize || pageSize.value
      })
      
      if (response.success) {
        projects.value = response.data.list
        total.value = response.data.total
        currentPage.value = response.data.page
        pageSize.value = response.data.pageSize
      }
    } catch (error) {
      console.error('获取项目列表失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const searchProjects = async (keyword: string) => {
    searchLoading.value = true
    try {
      const response = await mockApi.project.getProjects({
        projectName: searchParams.value.projectName,
        keyword: keyword,
        page: 1,
        pageSize: pageSize.value
      })
      
      if (response.success) {
        projects.value = response.data.list
        total.value = response.data.total
        currentPage.value = 1
      }
    } catch (error) {
      console.error('搜索项目失败:', error)
    } finally {
      searchLoading.value = false
    }
  }
  
  const createProject = async (projectData: {
    projectName: string
    description?: string
    members: Array<{ id: string; name: string; type: 'user' | 'group'; permission: string }>
  }) => {
    try {
      const response = await mockApi.project.createProject(projectData)
      if (response.success) {
        // 重新获取项目列表
        await fetchProjects({ page: 1 })
        return response
      }
      return response
    } catch (error) {
      console.error('创建项目失败:', error)
      return { success: false, message: '创建项目失败' }
    }
  }
  
  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const response = await mockApi.project.updateProject(id, updates)
      if (response.success) {
        // 更新本地数据
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1 && response.data) {
          projects.value[index] = response.data
        }
      }
      return response
    } catch (error) {
      console.error('更新项目失败:', error)
      return { success: false, message: '更新项目失败' }
    }
  }
  
  const deleteProject = async (id: string) => {
    try {
      const response = await mockApi.project.deleteProject(id)
      if (response.success) {
        // 从本地数据中移除
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1) {
          projects.value.splice(index, 1)
          total.value -= 1
        }
      }
      return response
    } catch (error) {
      console.error('删除项目失败:', error)
      return { success: false, message: '删除项目失败' }
    }
  }
  
  const setSearchParams = (params: Partial<typeof searchParams.value>) => {
    searchParams.value = { ...searchParams.value, ...params }
  }
  
  const resetSearch = () => {
    searchParams.value = {
      projectName: '',
      keyword: '',
      isAdvancedSearch: false
    }
  }
  
  const setPage = (page: number) => {
    currentPage.value = page
  }
  
  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1 // 重置到第一页
  }
  
  return {
    // 状态
    projects,
    loading,
    searchLoading,
    total,
    currentPage,
    pageSize,
    searchParams,
    
    // 计算属性
    hasProjects,
    totalPages,
    
    // Actions
    fetchProjects,
    searchProjects,
    createProject,
    updateProject,
    deleteProject,
    setSearchParams,
    resetSearch,
    setPage,
    setPageSize
  }
})