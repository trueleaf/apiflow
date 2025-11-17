<template>
  <div class="s-header" @click="handleDocumentClick">
    <div class="logo">
      <img :src="appSettingsStore.appLogo" :alt="appSettingsStore.appTitle" class="logo-img" width="24" height="24" draggable="false" @click="jumpToHome"/>
    </div>
    <div class="home" :class="{ active: activeTabId === ''}" @click="jumpToHome">
      <i class="iconfont iconhome"></i>
      <span>{{ t('主页面') }}</span>
    </div>
    <div v-if="filteredTabs.length > 0" class="divider">
      <span class="divider-content"></span>
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
    <button class="add-tab-btn" :title="t('新建项目')" @click="handleAddProject">+</button>
    <div v-if="filteredTabs.length > 0" class="divider">
      <span class="divider-content"></span>
    </div>
    <button class="ai-trigger-btn" :title="t('AI助手 Ctrl+L')" @click="handleShowAiDialog" ref="aiButtonRef">
      <Bot :size="16" />
      <!-- <span>{{ t('AI助手') }}</span> -->
    </button>
    <div class="right">
      <div class="navigation-control">
        <el-icon class="icon" size="16" :title="t('刷新主应用')" @click="refreshApp"><RefreshRight /></el-icon>
        <el-icon class="icon" size="16" :title="t('后退')" @click="goBack"><Back /></el-icon>
        <el-icon class="icon" size="16" :title="t('前进')" @click="goForward"><Right /></el-icon>
        <el-icon class="icon" size="16" :title="t('设置')" @click="jumpToSettings">
          <Settings :size="16" />
        </el-icon>
        <div class="icon" size="16" :title="t('切换语言')" @click="handleChangeLanguage" ref="languageButtonRef">
          <i class="iconfont iconyuyan custom-icon"></i>
          <span class="language-text">{{ currentLanguageDisplay }}</span>
        </div>
        <el-icon 
          size="16" 
          :title="networkMode === 'online' ? t('联网模式') : t('离线模式')" 
          @click="toggleNetworkMode" 
          class="network-btn icon"
        >
          <i class="iconfont network-icon" :class="networkMode === 'online' ? 'iconwifi' : 'iconwifi-off-line'"></i>
          <span class="network-text">{{ networkMode === 'online' ? t('联网模式') : t('离线模式') }}</span>
        </el-icon>
      </div>
      <div class="window-control">
        <i class="iconfont iconjianhao" id="minimize" :title="t('最小化')" @click="minimize"></i>
        <i v-if="!isMaximized" class="iconfont iconmaxScreen" id="maximize" :title="t('最大化')" @click="maximize"></i>
        <i v-if="isMaximized" class="iconfont iconminiScreen" id="unmaximize" :title="t('取消最大化')" @click="unmaximize"></i>
        <i class="iconfont iconguanbi close" id="close" :title="t('关闭')" @click="close"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, ComponentPublicInstance } from 'vue'
import draggable from 'vuedraggable'
import { Language, WindowState } from '@src/types'
import type { HeaderTab } from '@src/types/header'
import type { RuntimeNetworkMode } from '@src/types/runtime'
import { RefreshRight, Back, Right } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { Folder, Settings, Bot } from 'lucide-vue-next'
import type { AnchorRect } from '@src/types/common'
import { IPC_EVENTS } from '@src/types/ipc'
import { changeLanguage } from '@/i18n'
import { useAppSettings } from '@/store/appSettings/appSettingsStore'
import { useTheme } from '@/hooks/useTheme'

const appSettingsStore = useAppSettings()
const tabs = ref<HeaderTab[]>([])
const activeTabId = ref('')
const isMaximized = ref(false)
const tabListRef = ref<ComponentPublicInstance | null>(null)
const aiButtonRef = ref<HTMLElement>()
const { t } = useI18n()
const language = ref<Language>('zh-cn')
const networkMode = ref<RuntimeNetworkMode>('offline')
const filteredTabs = computed(() => {
  return tabs.value.filter(tab => tab.network === networkMode.value)
})
const draggableTabs = computed({
  get: () => tabs.value.filter(tab => tab.network === networkMode.value),
  set: (newTabs: HeaderTab[]) => {
    const otherNetworkTabs = tabs.value.filter(tab => tab.network !== networkMode.value)
    tabs.value = [...otherNetworkTabs, ...newTabs]
    syncTabsToContentView()
  }
})


/*
|--------------------------------------------------------------------------
| 窗口控制
|--------------------------------------------------------------------------
*/
const minimize = () => window.electronAPI?.windowManager.minimizeWindow()
const maximize = () => window.electronAPI?.windowManager.maximizeWindow()
const unmaximize = () => window.electronAPI?.windowManager.unMaximizeWindow()
const close = () => window.electronAPI?.windowManager.closeWindow()
const handleWindowResize = (state: WindowState) => {
  isMaximized.value = state.isMaximized
}
// 自动滚动到激活的tab
const scrollToActiveTab = () => {
  setTimeout(() => {
    const tabWrap = tabListRef.value?.$el
    const activeNode = tabWrap?.querySelector('.tab-item.active') as HTMLElement | null
    activeNode?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
}

/*
|--------------------------------------------------------------------------
| 导航控制
|--------------------------------------------------------------------------
*/
const refreshApp = () => {
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.rendererToMain.refreshApp)
}

const goBack = () => {
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.rendererToMain.goBack)
}

const goForward = () => {
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.rendererToMain.goForward)
}

/*
|--------------------------------------------------------------------------
| 语言切换
|--------------------------------------------------------------------------
*/
const currentLanguageDisplay = computed(() => {
  const languageMap: Record<Language, string> = {
    'zh-cn': '中',
    'zh-tw': '繁',
    'en': 'EN',
    'ja': 'JP'
  }
  return languageMap[language.value] || '中'
})
const languageButtonRef = ref<HTMLElement>()
const handleChangeLanguage = () => {
  if (languageButtonRef.value) {
    const rect = languageButtonRef.value.getBoundingClientRect()
    const buttonPosition = {
      x: rect.left,
      y: 0,
      width: rect.width,
      height: rect.height
    }

    // 发送显示语言菜单事件到主进程，包含按钮位置信息
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.showLanguageMenu, {
      position: buttonPosition,
      currentLanguage: language.value
    })
  }
}
/*
|--------------------------------------------------------------------------
| 同步函数
|--------------------------------------------------------------------------
*/
// 同步 tabs 到 contentView
const syncTabsToContentView = () => {
  window.electronAPI?.ipcManager.sendToMain(
    IPC_EVENTS.apiflow.topBarToContent.tabsUpdated,
    JSON.parse(JSON.stringify(tabs.value))
  )
}
// 同步 activeTabId 到 contentView
const syncActiveTabToContentView = () => {
  window.electronAPI?.ipcManager.sendToMain(
    IPC_EVENTS.apiflow.topBarToContent.activeTabUpdated,
    JSON.parse(JSON.stringify(activeTabId.value))
  )
}
/* 
|--------------------------------------------------------------------------
| tabs操作
|--------------------------------------------------------------------------
 */
const deleteTab = (tabId: string) => {
  const index = tabs.value.findIndex(t => t.id === tabId)
  if (index === -1) return
  
  const wasActive = activeTabId.value === tabId
  tabs.value = tabs.value.filter(t => t.id !== tabId)
  syncTabsToContentView()
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
  activeTabId.value = tabId;
  syncActiveTabToContentView()
  scrollToActiveTab()
  const currentTab = tabs.value.find(t => t.id === tabId);
  if (!currentTab) return;
  if (currentTab.type === 'project') {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.switchProject, {
      projectId: tabId,
      projectName: currentTab.title
    })
  } else if (currentTab.type === 'settings') {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.navigate, '/settings')
  }
}
/*
|--------------------------------------------------------------------------
| 其他
|--------------------------------------------------------------------------
*/
const jumpToHome = () => {
  activeTabId.value = '';
  syncActiveTabToContentView()
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.navigate, '/home')
}
// 跳转到设置
const jumpToSettings = () => {
  const settingsTabId = 'settings';
  const existingTab = tabs.value.find(t => t.id === settingsTabId);
  if (!existingTab) {
    tabs.value.push({
      id: settingsTabId,
      title: t('设置'),
      type: 'settings',
      network: networkMode.value
    });
    syncTabsToContentView()
  }
  switchTab(settingsTabId);
}
const toggleNetworkMode = () => {
  const newMode = networkMode.value === 'online' ? 'offline' : 'online'
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, newMode)
}
const handleAddProject = () => window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.createProject)
const handleShowAiDialog = () => {
  let position: AnchorRect | undefined
  if (aiButtonRef.value) {
    const rect = aiButtonRef.value.getBoundingClientRect()
    position = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  }
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.showAiDialog, { position })
}
// 绑定事件
const bindEvent = () => {
  window.electronAPI?.windowManager.onWindowResize(handleWindowResize)
  
  window.electronAPI?.windowManager.getWindowState().then((state) => {
    isMaximized.value = state.isMaximized
  })
  
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.languageChanged, (lang: string) => {
    language.value = lang as Language
    changeLanguage(lang as Language)
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.projectCreated, (data: { projectId: string, projectName: string }) => {
    tabs.value.push({ id: data.projectId, title: data.projectName, type: 'project', network: networkMode.value })
    activeTabId.value = data.projectId
    syncTabsToContentView()
    syncActiveTabToContentView()
    scrollToActiveTab()
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.projectChanged, (data: { projectId: string, projectName: string }) => {
    activeTabId.value = data.projectId;
    const matchedProject = tabs.value.find(t => t.id === data.projectId)
    if (!matchedProject) {
      tabs.value.push({ id: data.projectId, title: data.projectName, type: 'project', network: networkMode.value })
      syncTabsToContentView()
    } else if (matchedProject.title !== data.projectName) {
      matchedProject.title = data.projectName
      syncTabsToContentView()
    }
    syncActiveTabToContentView()
    scrollToActiveTab()
  })
  
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.projectDeleted, (projectId: string) => {
    deleteTab(projectId)
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.projectRenamed, (data: { projectId: string, projectName: string }) => {
    const index = tabs.value.findIndex(t => t.id === data.projectId)
    if (index !== -1) {
      tabs.value[index].title = data.projectName
      syncTabsToContentView()
    }
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.openSettingsTab, () => {
    jumpToSettings()
  })

  // 监听导航到首页事件
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.navigateToHome, () => {
    activeTabId.value = ''
    syncActiveTabToContentView()
  })

  // 监听来自 App.vue 的初始化数据
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.initTabsData, (data: { tabs: HeaderTab[], activeTabId: string, language: Language, networkMode: RuntimeNetworkMode }) => {
    tabs.value = data.tabs || [];
    activeTabId.value = data.activeTabId || '';
    language.value = data.language || 'zh-cn';
    networkMode.value = data.networkMode || 'offline';
    changeLanguage(language.value);
    syncTabsToContentView();
    syncActiveTabToContentView();
    scrollToActiveTab();
  });

  // 监听网络模式变更
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, (mode: RuntimeNetworkMode) => {
    networkMode.value = mode;
  });

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.appSettingsChanged, () => {
    appSettingsStore.refreshSettings()
    const { applyTheme } = useTheme()
    applyTheme(appSettingsStore.appTheme)
  });
}

// 处理document点击事件以关闭语言菜单
const handleDocumentClick = (event: MouseEvent) => {
  if (languageButtonRef.value && !languageButtonRef.value.contains(event.target as Node)) {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideLanguageMenu)
  }
}

onMounted(() => {
  bindEvent()
  scrollToActiveTab()
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.topBarReady);
  window.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

watch(() => networkMode.value, (mode, prevMode) => {
  if (mode !== prevMode) {
    activeTabId.value = ''
    syncActiveTabToContentView()
  }
})

</script>

<style lang="scss">
:root {
  --apiflow-header-height: 35px;
}

* {
  box-sizing: border-box;
}

body {
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

.s-header {
  height: var(--apiflow-header-height);
  display: flex;
  align-items: center;
  background: linear-gradient(to right, var(--color-header-bg-start), var(--color-header-bg-end));
  box-shadow: 0 1px 3px var(--shadow-md);
  -webkit-app-region: drag;
  color: var(--text-white);
  padding: 0 0 0 20px;
  // justify-content: space-between;
}
.logo {
  width: 44px;
  height: 100%;
  display: flex;
  -webkit-app-region: no-drag;
  align-items: center;
}
.logo-img {
  height: 24px;
  width: 24px;
  border-radius: 50%;
  object-fit: cover;
  will-change: auto;
}

.home {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  height: 35px;
  cursor: pointer;
  -webkit-app-region: no-drag;

  .iconfont {
    margin-top: 1px;
    font-size: 12px;
    margin-right: 3px;
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
.divider {
  width: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .divider-content {
    width: 1px;
    height: 70%;
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
  // padding: 0 30px 0 20px;
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
  -webkit-app-region: no-drag;
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
  -webkit-app-region: no-drag;
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
  padding: 0 12px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  transition: all 0.2s;
  -webkit-app-region: no-drag;
  flex-shrink: 0;
  border-radius: 3px;
  margin-right: 8px;
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
  width: 375px;
  margin-left: auto;
}

.navigation-control {
  display: flex;
  align-items: center;
  margin-right: 8px;
  border-right: 1px solid var(--bg-white-15);
  padding-right: 8px;
  -webkit-app-region: no-drag;

  .icon {
    width: 30px;
    height: 28px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-app-region: no-drag;
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
    width: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-app-region: no-drag;
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

.language-btn{
  width: 42px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: no-drag;
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
.window-control {
  display: flex;
  align-items: center;
}

.window-control i {
  width: 46px;
  height: 35px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: no-drag;
  cursor: pointer;
  transition: background-color 0.2s;
}

.window-control i:hover {
  background-color: var(--bg-white-10);
}

.window-control .close:hover {
  background-color: #e81123;
}

.sortable-ghost {
  opacity: 0.6;
}
</style>




