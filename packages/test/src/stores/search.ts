import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockApi } from '@/mock/api'
import type { UserOrGroup, User } from '@/types'

export const useSearchStore = defineStore('search', () => {
  // 状态
  const searchResults = ref<UserOrGroup[]>([])
  const userSearchResults = ref<User[]>([])
  const loading = ref(false)
  const query = ref('')
  
  // Actions
  const searchUserOrGroup = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      searchResults.value = []
      return
    }
    
    loading.value = true
    query.value = searchQuery
    
    try {
      const response = await mockApi.search.searchUserOrGroup(searchQuery)
      if (response.success) {
        searchResults.value = response.data
      }
    } catch (error) {
      console.error('搜索用户或组失败:', error)
      searchResults.value = []
    } finally {
      loading.value = false
    }
  }
  
  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      userSearchResults.value = []
      return
    }
    
    loading.value = true
    
    try {
      const response = await mockApi.search.searchUsers(searchQuery)
      if (response.success) {
        userSearchResults.value = response.data
      }
    } catch (error) {
      console.error('搜索用户失败:', error)
      userSearchResults.value = []
    } finally {
      loading.value = false
    }
  }
  
  const clearResults = () => {
    searchResults.value = []
    userSearchResults.value = []
    query.value = ''
  }
  
  return {
    // 状态
    searchResults,
    userSearchResults,
    loading,
    query,
    
    // Actions
    searchUserOrGroup,
    searchUsers,
    clearResults
  }
})