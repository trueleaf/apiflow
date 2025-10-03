import { defineStore } from 'pinia'

const STORAGE_KEY = 'test_user_preference'

interface UserPreference {
  selectedModuleId: string
  selectedTestCaseId: string
}

export const useUserPreferenceStore = defineStore('userPreference', {
  state: () => ({
    selectedModuleId: '',
    selectedTestCaseId: ''
  }),

  getters: {
    // 获取当前选中的模块ID
    currentModuleId: (state) => state.selectedModuleId,
    
    // 获取当前选中的用例ID
    currentTestCaseId: (state) => state.selectedTestCaseId
  },

  actions: {
    // 从 localStorage 加载用户偏好
    loadPreference() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const preference: UserPreference = JSON.parse(saved)
          this.selectedModuleId = preference.selectedModuleId || ''
          this.selectedTestCaseId = preference.selectedTestCaseId || ''
        }
      } catch (error) {
        console.error('加载用户偏好失败:', error)
      }
    },

    // 保存用户偏好到 localStorage
    savePreference() {
      try {
        const preference: UserPreference = {
          selectedModuleId: this.selectedModuleId,
          selectedTestCaseId: this.selectedTestCaseId
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preference))
      } catch (error) {
        console.error('保存用户偏好失败:', error)
      }
    },

    // 设置选中的模块
    setSelectedModule(moduleId: string) {
      this.selectedModuleId = moduleId
      this.savePreference()
    },

    // 设置选中的用例
    setSelectedTestCase(testCaseId: string) {
      this.selectedTestCaseId = testCaseId
      this.savePreference()
    },

    // 清空选中状态
    clearSelection() {
      this.selectedModuleId = ''
      this.selectedTestCaseId = ''
      this.savePreference()
    }
  }
})
