import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockApi } from '@/mock/api'
import type { Team } from '@/types'

export const useTeamStore = defineStore('team', () => {
  // 状态
  const teams = ref<Team[]>([])
  const loading = ref(false)
  const selectedTeamId = ref('')
  const searchText = ref('')
  
  // 计算属性
  const hasTeams = computed(() => teams.value.length > 0)
  const filteredTeams = computed(() => {
    if (!searchText.value) return teams.value
    return teams.value.filter(team =>
      team.groupName.toLowerCase().includes(searchText.value.toLowerCase())
    )
  })
  const selectedTeam = computed(() => 
    teams.value.find(team => team._id === selectedTeamId.value)
  )
  
  // Actions
  const fetchTeams = async (params?: { searchText?: string }) => {
    loading.value = true
    try {
      const response = await mockApi.team.getTeams(params)
      if (response.success) {
        teams.value = response.data
        // 如果没有选中的团队，默认选中第一个
        if (!selectedTeamId.value && teams.value.length > 0) {
          selectedTeamId.value = teams.value[0]._id
        }
      }
    } catch (error) {
      console.error('获取团队列表失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const createTeam = async (teamData: {
    groupName: string
    description?: string
    members: Array<{ id: string; userName: string; realName: string }>
  }) => {
    try {
      const response = await mockApi.team.createTeam(teamData)
      if (response.success) {
        // 重新获取团队列表
        await fetchTeams()
        // 选中新创建的团队
        if (response.data) {
          selectedTeamId.value = response.data._id
        }
      }
      return response
    } catch (error) {
      console.error('创建团队失败:', error)
      return { success: false, message: '创建团队失败' }
    }
  }
  
  const deleteTeam = async (id: string) => {
    try {
      const response = await mockApi.team.deleteTeam(id)
      if (response.success) {
        // 从本地数据中移除
        const index = teams.value.findIndex(t => t._id === id)
        if (index !== -1) {
          teams.value.splice(index, 1)
          
          // 如果删除的是当前选中的团队，选中第一个团队
          if (selectedTeamId.value === id) {
            selectedTeamId.value = teams.value.length > 0 ? teams.value[0]._id : ''
          }
        }
      }
      return response
    } catch (error) {
      console.error('删除团队失败:', error)
      return { success: false, message: '删除团队失败' }
    }
  }
  
  const selectTeam = (teamId: string) => {
    selectedTeamId.value = teamId
  }
  
  const setSearchText = (text: string) => {
    searchText.value = text
  }
  
  const clearSelection = () => {
    selectedTeamId.value = ''
  }
  
  return {
    // 状态
    teams,
    loading,
    selectedTeamId,
    searchText,
    
    // 计算属性
    hasTeams,
    filteredTeams,
    selectedTeam,
    
    // Actions
    fetchTeams,
    createTeam,
    deleteTeam,
    selectTeam,
    setSearchText,
    clearSelection
  }
})