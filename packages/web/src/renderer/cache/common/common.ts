/*
|--------------------------------------------------------------------------
| 通用缓存模块
| 用于管理各类提示状态等通用配置
| 每个提示使用独立的 localStorage 键和专门的函数对
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Mock JSON 随机大小提示
|--------------------------------------------------------------------------
*/
const MOCK_JSON_RANDOM_SIZE_HINT_KEY = 'hint/mockJsonRandomSizeHint'

// 获取 Mock JSON 随机大小提示是否可见
export const getMockJsonRandomSizeHintVisible = (): boolean => {
  try {
    const value = localStorage.getItem(MOCK_JSON_RANDOM_SIZE_HINT_KEY)
    // 未设置时默认显示（返回 true）
    if (value === null) {
      return true
    }
    return value !== 'false'
  } catch (error) {
    console.error('获取 Mock JSON 随机大小提示状态失败:', error)
    return true // 出错时默认显示
  }
}

// 设置 Mock JSON 随机大小提示是否可见
export const setMockJsonRandomSizeHintVisible = (visible: boolean): void => {
  try {
    localStorage.setItem(MOCK_JSON_RANDOM_SIZE_HINT_KEY, visible ? 'true' : 'false')
  } catch (error) {
    console.error('设置 Mock JSON 随机大小提示状态失败:', error)
  }
}
