import { defineStore } from 'pinia'
import { moduleTreeData, testModulesData } from '../mock/testCaseData'
import type { ModuleStatistics, TestCase } from '../types'

export const useTestModuleStore = defineStore('testModule', {
  state: () => ({
    moduleStatistics: [] as ModuleStatistics[]
  }),

  getters: {
    // 获取所有模块统计数据
    allModuleStatistics: (state) => state.moduleStatistics,

    // 获取有测试用例的模块数量
    moduleCount: (state) => state.moduleStatistics.length
  },

  actions: {
    // 初始化模块统计数据
    initModuleStatistics() {
      const statistics: ModuleStatistics[] = []

      // 遍历所有测试模块
      testModulesData.forEach((module) => {
        const testCases = module.testCases
        
        // 如果没有测试用例，跳过
        if (testCases.length === 0) {
          return
        }

        // 计算该模块的统计数据
        const stats = this.calculateStatistics(testCases)
        statistics.push({
          id: module.id,
          name: module.name,
          level: 'leaf',
          ...stats
        })
      })

      this.moduleStatistics = statistics
    },

    // 计算测试用例的统计数据
    calculateStatistics(testCases: TestCase[]) {
      const stats = {
        total: testCases.length,
        passed: 0,
        failed: 0,
        pending: 0
      }

      testCases.forEach((testCase) => {
        if (testCase.status === 'passed') {
          stats.passed++
        } else if (testCase.status === 'failed') {
          stats.failed++
        } else if (testCase.status === 'pending') {
          stats.pending++
        }
      })

      return stats
    }
  }
})
