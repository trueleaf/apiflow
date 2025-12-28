<template>
  <div class="browser-header">
    <div class="logo">
      <img :src="appSettingsStore.appLogo" :alt="appSettingsStore.appTitle" class="logo-img" width="24" height="24" draggable="false" @click="jumpToHome"/>
    </div>
    <div class="home" :class="{ active: activeTabId === ''}" data-testid="header-home-btn" @click="jumpToHome">
      <i class="iconfont iconhome"></i>
      <span>{{ t('主页面') }}</span>
    </div>
    <div v-if="showAdminMenu" class="home admin" :class="{ active: activeTabId === '__admin__' }" data-testid="header-admin-btn" @click="jumpToAdmin">
      <Shield class="menu-icon" :size="14" />
      <span>{{ t('后台管理') }}</span>
    </div>
    <div v-if="filteredTabs.length > 0" class="short-divider">
      <span class="short-divider-content"></span>
    </div>
    <div class="tabs">
      <draggable ref="tabListRef" v-model="draggableTabs" class="tab-list" :animation="150" ghost-class="sortable-ghost"
        chosen-class="sortable-chosen" drag-class="sortable-drag" item-key="id">
        <template #item="{ element: tab }">
          <li :class="['tab-item', { active: tab.id === activeTabId }]" :title="tab.title" :data-id="tab.id" @click="switchTab(tab.id)">
            <Folder v-if="tab.type === 'project'" class="tab-icon" :size="14" />
            <Settings v-if="tab.type === 'settings'" class="tab-icon" :size="14" />
            <span class="tab-title">{{ tab.title }}</span>
            <span class="close-btn iconfont iconguanbi" @click.stop="deleteTab(tab.id)"></span>
          </li>
        </template>
      </draggable>
    </div>
    <button class="add-tab-btn" :title="t('新建项目')" data-testid="header-add-project-btn" @click="handleAddProject">+</button>
    
    <div class="right">
      <button class="ai-trigger-btn" :title="t('AI助手 Ctrl+L')" data-testid="header-ai-btn" @click="handleShowAiDialog" ref="aiButtonRef">
        <Bot :size="16" />
      </button>
      <div class="navigation-control">
        <el-icon class="icon" size="16" :title="t('刷新页面')" data-testid="header-refresh-btn" @click="refreshApp"><RefreshRight /></el-icon>
        <el-icon class="icon" size="16" :title="t('后退')" data-testid="header-back-btn" @click="goBack"><Back /></el-icon>
        <el-icon class="icon" size="16" :title="t('前进')" data-testid="header-forward-btn" @click="goForward"><Right /></el-icon>
        <el-icon class="icon" size="16" :title="t('设置')" data-testid="header-settings-btn" @click="jumpToSettings">
          <Settings :size="16" />
        </el-icon>
        <div class="icon language-btn" :title="t('切换语言')" data-testid="header-language-btn" @click="toggleLanguageMenu" ref="languageButtonRef">
          <i class="iconfont iconyuyan custom-icon"></i>
          <span class="language-text">{{ currentLanguageDisplay }}</span>
        </div>
        <div 
          :title="networkMode === 'online' ? t('联网模式') : t('离线模式')" 
          data-testid="header-network-toggle"
          @click="toggleNetworkMode" 
          class="network-btn icon"
        >
          <i class="iconfont network-icon" :class="networkMode === 'online' ? 'iconwifi' : 'iconwifi-off-line'"></i>
          <span class="network-text">{{ networkMode === 'online' ? t('联网模式') : t('离线模式') }}</span>
        </div>
      </div>
    </div>
    <!-- 语言选择菜单 -->
    <LanguageMenu
      :visible="languageMenuVisible"
      :position="languageMenuPosition"
      :current-language="language"
      @language-select="handleLanguageSelect"
      @close="hideLanguageMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, ComponentPublicInstance } from 'vue'
import draggable from 'vuedraggable'
import { Language } from '@src/types'
import type { AnchorRect } from '@src/types/common'
import type { AppWorkbenchHeaderTab } from '@src/types/appWorkbench/appWorkbenchType'
 import type { RuntimeNetworkMode } from '@src/types/runtime'
 import { RefreshRight, Back, Right } from '@element-plus/icons-vue'       
 import { useI18n } from 'vue-i18n'
 import { Folder, Settings, Bot, Shield } from 'lucide-vue-next'
 import { changeLanguage } from '@/i18n'
 import { useAppSettings } from '@/store/appSettings/appSettingsStore'     
 import { useRuntime } from '@/store/runtime/runtimeStore'
 import { useRouter } from 'vue-router'
 import { appWorkbenchCache } from '@/cache/appWorkbench/appWorkbenchCache'
import { useAgentViewStore } from '@/store/ai/agentView'
import LanguageMenu from '@/components/common/language/Language.vue'

const emit = defineEmits<{
  (e: 'createProject'): void
}>()

const router = useRouter()
const appSettingsStore = useAppSettings()
const runtimeStore = useRuntime()
const agentViewStore = useAgentViewStore()
const tabs = ref<AppWorkbenchHeaderTab[]>([])
const activeTabId = ref('')
const tabListRef = ref<ComponentPublicInstance | null>(null)
const aiButtonRef = ref<HTMLElement>()
const languageButtonRef = ref<HTMLElement>()
const { t } = useI18n()
const language = ref<Language>('zh-cn')
 const networkMode = ref<RuntimeNetworkMode>('offline')
 // 语言菜单相关状态
 const languageMenuVisible = ref(false)
 const languageMenuPosition = ref<AnchorRect>({ x: 0, y: 0, width: 0, height: 0 })
 const showAdminMenu = computed(() => {
   return networkMode.value === 'online' && runtimeStore.userInfo.role === 'admin' && Boolean(runtimeStore.userInfo.id)
 })

 const filteredTabs = computed(() => {
   return tabs.value.filter(tab => tab.network === networkMode.value)      
 })
const draggableTabs = computed({
  get: () => tabs.value.filter(tab => tab.network === networkMode.value),
  set: (newTabs: AppWorkbenchHeaderTab[]) => {
    const otherNetworkTabs = tabs.value.filter(tab => tab.network !== networkMode.value)
    tabs.value = [...otherNetworkTabs, ...newTabs]
    syncTabsToCache()
  }
})
// 获取项目类型 tab 应该插入的位置索引
const getProjectTabInsertIndex = () => {
  const currentNetworkTabs = tabs.value.filter(tab => tab.network === networkMode.value)
  const lastProjectIndex = currentNetworkTabs.reduce((lastIdx, tab, idx) => {
    return tab.type === 'project' ? idx : lastIdx
  }, -1)
  if (lastProjectIndex === -1) {
    const firstNetworkTabIndex = tabs.value.findIndex(tab => tab.network === networkMode.value)
    return firstNetworkTabIndex === -1 ? tabs.value.length : firstNetworkTabIndex
  }
  const lastProjectTab = currentNetworkTabs[lastProjectIndex]
  return tabs.value.indexOf(lastProjectTab) + 1
}
// 同步 tabs 到缓存
const syncTabsToCache = () => {
  appWorkbenchCache.setAppWorkbenchHeaderTabs(JSON.parse(JSON.stringify(tabs.value)))
}
// 同步 activeTabId 到缓存
const syncActiveTabToCache = () => {
  appWorkbenchCache.setAppWorkbenchHeaderActiveTab(activeTabId.value)
}
// 自动滚动到激活的tab
const scrollToActiveTab = () => {
  setTimeout(() => {
    const tabWrap = tabListRef.value?.$el
    const activeNode = tabWrap?.querySelector('.tab-item.active') as HTMLElement | null
    activeNode?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
}
// 导航控制
const refreshApp = () => {
  window.location.reload()
}
const goBack = () => {
  router.back()
}
const goForward = () => {
  router.forward()
}
// 语言切换
const currentLanguageDisplay = computed(() => {
  const languageMap: Record<Language, string> = {
    'zh-cn': '中',
    'zh-tw': '繁',
    'en': 'EN',
    'ja': 'JP'
  }
  return languageMap[language.value] || '中'
})
const toggleLanguageMenu = () => {
  if (languageButtonRef.value) {
    const rect = languageButtonRef.value.getBoundingClientRect()
    languageMenuPosition.value = {
      x: rect.left,
      y: rect.bottom + 5,
      width: rect.width,
      height: rect.height
    }
    languageMenuVisible.value = !languageMenuVisible.value
  }
}
const hideLanguageMenu = () => {
  languageMenuVisible.value = false
}
const handleLanguageSelect = (lang: Language) => {
  language.value = lang
  runtimeStore.setLanguage(lang)
  changeLanguage(lang)
  hideLanguageMenu()
}
// tabs操作
const deleteTab = (tabId: string) => {
  const index = tabs.value.findIndex(t => t.id === tabId)
  if (index === -1) return
  
  const wasActive = activeTabId.value === tabId
  tabs.value = tabs.value.filter(t => t.id !== tabId)
  syncTabsToCache()
  const currentNetworkTabs = tabs.value.filter(tab => tab.network === networkMode.value)
  
  if (currentNetworkTabs.length === 0) {
    jumpToHome()
  } else if (wasActive) {
    const currentModeIndex = currentNetworkTabs.findIndex(t => tabs.value.indexOf(t) >= index)
    const newActiveTabId = currentModeIndex !== -1 
      ? currentNetworkTabs[currentModeIndex].id 
      : currentNetworkTabs[currentNetworkTabs.length - 1].id
    
    switchTab(newActiveTabId)
  }
}
const switchTab = (tabId: string) => {
  if (runtimeStore.networkMode === 'online' && router.currentRoute.value.path === '/login' && tabId !== `settings-${networkMode.value}`) {
    return
  }
  activeTabId.value = tabId
  syncActiveTabToCache()
  scrollToActiveTab()
  const currentTab = tabs.value.find(t => t.id === tabId)
  if (!currentTab) return
  if (currentTab.type === 'project') {
    router.push({
      path: '/workbench',
      query: {
        id: tabId,
        name: currentTab.title,
        mode: 'edit'
      }
    })
  } else if (currentTab.type === 'settings') {
    router.push('/settings')
  }
}
// 其他操作
const jumpToHome = () => {
  if (runtimeStore.networkMode === 'online' && router.currentRoute.value.path === '/login') {
    return
  }
  activeTabId.value = ''
  syncActiveTabToCache()
  router.push('/home')
}
const jumpToAdmin = () => {
  if (runtimeStore.networkMode === 'online' && router.currentRoute.value.path === '/login') {
    return
  }
  activeTabId.value = '__admin__'
  syncActiveTabToCache()
  router.push('/admin')
}
const jumpToSettings = () => {
  const settingsTabId = `settings-${networkMode.value}`
  const existingTab = tabs.value.find(t => t.id === settingsTabId)        
  if (!existingTab) {
    tabs.value.push({
      id: settingsTabId,
      title: t('设置'),
      type: 'settings',
      network: networkMode.value
    })
    syncTabsToCache()
  }
  switchTab(settingsTabId)
}
const toggleNetworkMode = () => {
  const newMode = networkMode.value === 'online' ? 'offline' : 'online'
  networkMode.value = newMode
  runtimeStore.setNetworkMode(newMode)
}
const handleAddProject = () => {
  emit('createProject')
}
const handleShowAiDialog = () => {
  agentViewStore.showAgentViewDialog()
}
// 添加项目 Tab
const addProjectTab = (projectId: string, projectName: string) => {
  const insertIndex = getProjectTabInsertIndex()
  tabs.value.splice(insertIndex, 0, { 
    id: projectId, 
    title: projectName, 
    type: 'project', 
    network: networkMode.value 
  })
  activeTabId.value = projectId
  syncTabsToCache()
  syncActiveTabToCache()
  scrollToActiveTab()
}
// 切换到项目
const switchToProject = (projectId: string, projectName: string) => {
  activeTabId.value = projectId
  const matchedProject = tabs.value.find(t => t.id === projectId)
  if (!matchedProject) {
    const insertIndex = getProjectTabInsertIndex()
    tabs.value.splice(insertIndex, 0, { 
      id: projectId, 
      title: projectName, 
      type: 'project', 
      network: networkMode.value 
    })
    syncTabsToCache()
  } else if (matchedProject.title !== projectName) {
    matchedProject.title = projectName
    syncTabsToCache()
  }
  syncActiveTabToCache()
  scrollToActiveTab()
}
// 初始化
const initTabs = () => {
  const cachedTabs = appWorkbenchCache.getAppWorkbenchHeaderTabs() || []
  const cachedActiveTabId = appWorkbenchCache.getAppWorkbenchHeaderActiveTab() || ''
  tabs.value = cachedTabs
  activeTabId.value = cachedActiveTabId
  language.value = runtimeStore.language
  networkMode.value = runtimeStore.networkMode
  scrollToActiveTab()
}
// 监听路由变化
watch(
  () => ({
    path: router.currentRoute.value.path,
    query: router.currentRoute.value.query
  }),
  (newRoute) => {
    if (newRoute.path === '/workbench') {
      const projectId = newRoute.query.id as string
      const projectName = newRoute.query.name as string
      if (projectId && projectName) {
        switchToProject(projectId, projectName)
      }
    } else if (newRoute.path === '/admin') {
      activeTabId.value = '__admin__'
      syncActiveTabToCache()
    } else if (newRoute.path === '/home') {
      activeTabId.value = ''
      syncActiveTabToCache()
    } else if (newRoute.path === '/login') {
      if (runtimeStore.networkMode === 'online') {
        activeTabId.value = 'login'
        syncActiveTabToCache()
      }
    }
  },
  { deep: true }
)
// 监听网络模式变化
watch(() => networkMode.value, (mode, prevMode) => {
  if (mode !== prevMode) {
    activeTabId.value = ''
    syncActiveTabToCache()
  }
})
// 处理点击事件关闭语言菜单
const handleDocumentClick = (event: MouseEvent) => {
  if (languageButtonRef.value && !languageButtonRef.value.contains(event.target as Node)) {
    hideLanguageMenu()
  }
}

onMounted(() => {
  initTabs()
  if (runtimeStore.networkMode === 'online' && router.currentRoute.value.path === '/login') {
    activeTabId.value = 'login'
    syncActiveTabToCache()
  }
  window.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleDocumentClick)
})
// 暴露方法供父组件调用
defineExpose({
  addProjectTab,
  switchToProject
})
</script>

<style lang="scss" scoped>
.browser-header {
  height: 35px;
  display: flex;
  align-items: center;
  background: linear-gradient(to right, var(--color-header-bg-start), var(--color-header-bg-end));
  box-shadow: 0 1px 3px var(--shadow-md);
  color: var(--text-white);
  padding: 0 10px 0 20px;
  position: relative;
  z-index: 100;
}
.logo {
  width: 44px;
  height: 100%;
  display: flex;
  align-items: center;
}
.logo-img {
  height: 24px;
  width: 24px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}
.home {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 10px;
  height: 35px;
  cursor: pointer;
  .iconfont {
    margin-top: 1px;
    font-size: 12px;
    margin-right: 3px;
  }
  .menu-icon {
    margin-right: 3px;
  }
  &.admin {
    width: 92px;
  }
  &.active {
    color: var(--text-white);
    background-color: var(--bg-white-40);
  }
  &:hover:not(.active) {
    color: var(--text-white);
    background-color: var(--bg-white-10);
  }
}
.short-divider {
  width: 1px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .short-divider-content {
    width: 1px;
    height: 50%;
    background-color: var(--bg-white-15);
  }
}
.tabs {
  height: 100%;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 600px;
  scrollbar-width: none;
  &:hover {
    &::-webkit-scrollbar {
      display: block;
    }
  }
  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    display: none;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-500);
  }
}
.tab-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  height: calc(100% - 6px);
  gap: 2px;
}
.tab-item {
  height: 100%;
  max-width: 200px;
  min-width: 100px;
  padding: 0 5px 0 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  margin-right: 2px;
}
.tab-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  flex-shrink: 0;
}
.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tab-item .close-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
  opacity: 0;
}
.tab-item:hover .close-btn,
.tab-item.active .close-btn {
  opacity: 1;
}
.tab-item:hover:not(.active) {
  background: var(--bg-white-15);
}
.tab-item.active {
  color: var(--text-white);
  background-color: var(--bg-white-40);
}
.tab-item:not(.active)::after {
  content: '';
  position: absolute;
  right: 1px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 50%;
  background-color: var(--bg-white-15);
}
.tab-item:not(.active):has(+ .tab-item.active)::after {
  display: none;
}
.tab-item .close-btn:hover {
  background: var(--bg-white-10);
  opacity: 1;
}
.add-tab-btn {
  padding: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  transition: all 0.2s;
  flex-shrink: 0;
  margin: 0 8px;
}
.add-tab-btn:focus {
  outline: none;
  box-shadow: none;
}
.add-tab-btn:hover {
  background: var(--bg-white-15);
  border-radius: 3px;
}
.ai-trigger-btn {
  padding: 0 8px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 12px;
  transition: all 0.2s;
  flex-shrink: 0;
  border-radius: 3px;
}
.ai-trigger-btn:focus {
  outline: none;
  box-shadow: none;
}
.ai-trigger-btn:hover {
  background: var(--bg-white-15);
}
.right {
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: auto;
}
.navigation-control {
  display: flex;
  align-items: center;
  .icon {
    width: 30px;
    height: 28px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
    border-radius: 3px;
    margin: 0 1px;
    font-style: normal;
    &:hover {
      background-color: var(--bg-white-10);
    }
  }
  .network-btn {
    flex: 0 0 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-emphasis: none;
    font-style: normal;
    margin-left: 5px;
  }
  .custom-icon {
    font-size: 13px;
  }
  .network-icon {
    font-size: 14px;
  }
}
.language-btn {
  width: 42px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 3px;
  margin: 0 1px;
  font-size: 11px;
  color: var(--text-white);
}
.language-btn:hover {
  background-color: var(--bg-white-10);
}
.language-btn .iconfont {
  font-size: 12px;
  margin-right: 2px;
}
.language-text {
  font-size: 10px;
  font-weight: 500;
}
.network-text {
  font-size: 10px;
}
.sortable-ghost {
  opacity: 0.6;
}
</style>
