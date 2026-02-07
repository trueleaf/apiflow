<template>
  <div class="s-header" @click="handleDocumentClick">
    <div class="logo">
      <img data-test-id="header-logo" :src="appSettingsStore.appLogo" :alt="appSettingsStore.appTitle" class="logo-img" width="24" height="24" draggable="false" @click="jumpToHome"/>
    </div>
    <div class="home" :class="{ active: activeTabId === ''}" data-testid="header-home-btn" @click="jumpToHome">
      <Home class="menu-icon" :size="14" />
      <span>{{ t('主页面') }}</span>
    </div>
    <div v-if="filteredTabs.length > 0" class="short-divider">
      <span class="short-divider-content"></span>
    </div>
    <div class="tabs" data-test-id="header-tabs-container">
      <draggable ref="tabListRef" v-model="draggableTabs" class="tab-list" :animation="150" ghost-class="sortable-ghost"
        chosen-class="sortable-chosen" drag-class="sortable-drag" item-key="id">
        <template #item="{ element: tab }">
          <li :data-test-id="`header-tab-item-${tab.id}`" :class="['tab-item', { active: tab.id === activeTabId }]" :title="tab.title" :data-id="tab.id" @click="switchTab(tab.id)" @contextmenu.stop.prevent="handleTabContextmenu($event, tab)">
            <Folder v-if="tab.type === 'project'" class="tab-icon" :size="14" />
            <Settings v-if="tab.type === 'settings'" class="tab-icon" :size="14" />
            <span class="tab-title">{{ tab.title }}</span>
            <span :data-test-id="`header-tab-close-btn-${tab.id}`" class="close-btn iconfont iconguanbi" @click.stop="deleteTab(tab.id)"></span>
          </li>
        </template>
      </draggable>
    </div>
    <button class="add-tab-btn" :title="t('新建项目')" data-testid="header-add-project-btn" @click="handleAddProject">+</button>
    
    <div class="right">
      <div class="navigation-control">
        <button v-if="showDownloadProgress" class="icon-btn icon-btn-with-text download-progress-btn" :title="t('查看下载进度')" data-testid="header-download-progress-btn" @click="jumpToDownloadPage">
          <Download :size="14" />
          <span class="download-percent">{{ downloadPercent }}</span>
        </button>
        <button class="icon-btn" :title="t('AI助手 Ctrl+L')" data-testid="header-ai-btn" @click="handleShowAiDialog" ref="aiButtonRef">
          <Bot :size="16" />
        </button>
        <button class="icon-btn" :title="t('刷新主应用')" data-testid="header-refresh-btn" @click="refreshApp">
          <RefreshCw :size="14" />
        </button>
        <button class="icon-btn" :title="t('后退')" data-testid="header-back-btn" @click="goBack">
          <ArrowLeft :size="14" />
        </button>
        <button class="icon-btn" :title="t('前进')" data-testid="header-forward-btn" @click="goForward">
          <ArrowRight :size="14" />
        </button>
        <button class="icon-btn" :title="t('设置')" data-testid="header-settings-btn" @click="jumpToSettings">
          <Settings :size="14" />
        </button>
        <button class="icon-btn icon-btn-with-text" :title="t('切换语言')" data-testid="header-language-btn" @click="handleChangeLanguage" ref="languageButtonRef">
          <Languages :size="14" />
          <span class="icon-text">{{ currentLanguageDisplay }}</span>
        </button>
        <button 
          class="icon-btn icon-btn-with-text" 
          :title="networkMode === 'online' ? t('联网模式') : t('离线模式')" 
          data-testid="header-network-toggle"
          @click="toggleNetworkMode"
        >
          <Wifi v-if="networkMode === 'online'" :size="14" />
          <WifiOff v-else :size="14" />
          <span class="icon-text">{{ networkMode === 'online' ? t('联网模式') : t('离线模式') }}</span>
        </button>
        <button
          v-if="networkMode === 'online' && runtimeStore.userInfo.token"        
          class="icon-btn"
          :title="runtimeStore.userInfo.loginName"
          data-testid="header-user-menu-btn"
          @click.stop="handleOpenUserMenu"
          ref="userAvatarButtonRef"
        >
          <img v-if="runtimeStore.userInfo.avatar" class="user-avatar-img" :src="runtimeStore.userInfo.avatar" draggable="false" />
          <User v-else :size="14" />
        </button>
      </div>
      <div class="window-control">
        <i class="iconfont iconjianhao" id="minimize" :title="t('最小化')" data-testid="header-minimize-btn" @click="minimize"></i>
        <i v-if="!isMaximized" class="iconfont iconmaxScreen" id="maximize" :title="t('最大化')" data-testid="header-maximize-btn" @click="maximize"></i>
        <i v-if="isMaximized" class="iconfont iconminiScreen" id="unmaximize" :title="t('取消最大化')" data-testid="header-unmaximize-btn" @click="unmaximize"></i>
        <i class="iconfont iconguanbi close" id="close" :title="t('关闭')" data-testid="header-close-btn" @click="close"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, ComponentPublicInstance, reactive, nextTick } from 'vue'
import draggable from 'vuedraggable'
 import { Language, WindowState } from '@src/types'
 import type { AppWorkbenchHeaderTab, AppWorkbenchHeaderTabContextActionPayload } from '@src/types/appWorkbench/appWorkbenchType'
 import type { RuntimeNetworkMode } from '@src/types/runtime'
 import { useI18n } from 'vue-i18n'
 import { Folder, Settings, Bot, User, RefreshCw, ArrowLeft, ArrowRight, Languages, Wifi, WifiOff, Home, Download } from 'lucide-vue-next'
 import { IPC_EVENTS } from '@src/types/ipc'
 import { UPDATE_IPC_EVENTS } from '@src/types/ipc/update'
 import type { DownloadProgress, DownloadState } from '@src/types/update'       
 import { changeLanguage } from '@/i18n'
 import { useAppSettings } from '@/store/appSettings/appSettingsStore'
 import { useTheme } from '@/hooks/useTheme'
 import { useRuntime } from '@/store/runtime/runtimeStore'
import type { PermissionUserInfo } from '@src/types/project'

const appSettingsStore = useAppSettings()
const tabs = ref<AppWorkbenchHeaderTab[]>([])
const activeTabId = ref('')
const isMaximized = ref(false)
const tabListRef = ref<ComponentPublicInstance | null>(null)
const { t } = useI18n()
const language = ref<Language>('zh-cn')
const networkMode = ref<RuntimeNetworkMode>('offline')
const skipNextNetworkModeWatch = ref(false)
const runtimeStore = useRuntime()
const isAppStore = ref(false)
const downloadState = reactive({
  state: 'idle' as DownloadState,
  percent: 0
})
const showDownloadProgress = computed(() => {
  return !isAppStore.value 
    && (downloadState.state === 'downloading' || downloadState.state === 'paused') 
    && downloadState.percent > 0 
    && downloadState.percent < 100
})
const downloadPercent = computed(() => {
  return downloadState.percent.toFixed(2) + '%'
})
const filteredTabs = computed(() => {
  return tabs.value.filter(tab => tab.network === networkMode.value)      
})
const draggableTabs = computed({
  get: () => tabs.value.filter(tab => tab.network === networkMode.value),
  set: (newTabs: AppWorkbenchHeaderTab[]) => {
    const otherNetworkTabs = tabs.value.filter(tab => tab.network !== networkMode.value)
    tabs.value = [...otherNetworkTabs, ...newTabs]
    syncTabsToContentView()
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
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideUserMenu)
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideHeaderTabContextmenu)
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

const userAvatarButtonRef = ref<HTMLElement>()
const handleOpenUserMenu = () => {
  if (userAvatarButtonRef.value) {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideLanguageMenu)
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideHeaderTabContextmenu)
    const rect = userAvatarButtonRef.value.getBoundingClientRect()
    const buttonPosition = {
      x: rect.left,
      y: 0,
      width: rect.width,
      height: rect.height
    }
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.showUserMenu, {
      position: buttonPosition
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
  if (networkMode.value === 'online' && activeTabId.value === 'login' && tabId !== `settings-${networkMode.value}`) {
    return
  }
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
const deleteTabsByIds = (tabIds: string[], preferredActiveTabId?: string) => {
  if (tabIds.length === 0) return
  const wasActiveDeleted = tabIds.includes(activeTabId.value)
  tabs.value = tabs.value.filter(t => !tabIds.includes(t.id))
  syncTabsToContentView()
  const currentNetworkTabs = tabs.value.filter(tab => tab.network === networkMode.value)
  if (currentNetworkTabs.length === 0) {
    jumpToHome()
    return
  }
  if (!wasActiveDeleted) return
  const nextActiveTabId = preferredActiveTabId && currentNetworkTabs.some(t => t.id === preferredActiveTabId)
    ? preferredActiveTabId
    : currentNetworkTabs[currentNetworkTabs.length - 1].id
  switchTab(nextActiveTabId)
}
const handleHeaderTabContextAction = (payload: AppWorkbenchHeaderTabContextActionPayload) => {
  const currentNetworkTabs = tabs.value.filter(tab => tab.network === networkMode.value)
  const currentIndex = currentNetworkTabs.findIndex(t => t.id === payload.tabId)
  if (payload.action === 'close') {
    deleteTab(payload.tabId)
    return
  }
  if (payload.action === 'closeLeft') {
    if (currentIndex <= 0) return
    deleteTabsByIds(currentNetworkTabs.slice(0, currentIndex).map(t => t.id), payload.tabId)
    return
  }
  if (payload.action === 'closeRight') {
    if (currentIndex === -1 || currentIndex >= currentNetworkTabs.length - 1) return
    deleteTabsByIds(currentNetworkTabs.slice(currentIndex + 1).map(t => t.id), payload.tabId)
    return
  }
  if (payload.action === 'closeOther') {
    deleteTabsByIds(currentNetworkTabs.filter(t => t.id !== payload.tabId).map(t => t.id), payload.tabId)
    return
  }
  if (payload.action === 'closeAll') {
    deleteTabsByIds(currentNetworkTabs.map(t => t.id))
  }
}
const handleTabContextmenu = (e: MouseEvent, tab: AppWorkbenchHeaderTab) => {
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideLanguageMenu)
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideUserMenu)
  const currentNetworkTabs = filteredTabs.value
  const tabIndex = currentNetworkTabs.findIndex(t => t.id === tab.id)
  const hasAny = currentNetworkTabs.length > 0
  const hasOther = currentNetworkTabs.length > 1
  const hasLeft = tabIndex > 0
  const hasRight = tabIndex !== -1 && tabIndex < currentNetworkTabs.length - 1
  const currentTarget = e.currentTarget as HTMLElement | null
  const rect = currentTarget?.getBoundingClientRect()
  const position = rect
    ? { x: rect.left, y: 0, width: rect.width, height: rect.height }
    : { x: e.clientX, y: 0, width: 0, height: 0 }
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.showHeaderTabContextmenu, {
    position,
    tabId: tab.id,
    hasLeft,
    hasRight,
    hasOther,
    hasAny
  })
}
/*
|--------------------------------------------------------------------------     
| 其他
|--------------------------------------------------------------------------     
*/
const jumpToHome = () => {
  if (networkMode.value === 'online' && activeTabId.value === 'login') {
    return
  }
  activeTabId.value = '';
  syncActiveTabToContentView()
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.navigate, '/home')
}
// 跳转到设置
const jumpToSettings = () => {
  const settingsTabId = `settings-${networkMode.value}`;
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
  if (runtimeStore.networkMode !== newMode) {
    runtimeStore.setNetworkMode(newMode)
  }
  networkMode.value = newMode
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, newMode)
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.reloadAfterNetworkModeChange)
}
const handleAddProject = () => window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.createProject)
const handleShowAiDialog = () => window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.showAiDialog)
const jumpToDownloadPage = () => {
  const settingsTabId = `settings-${networkMode.value}`
  const existingTab = tabs.value.find(t => t.id === settingsTabId)
  if (!existingTab) {
    tabs.value.push({
      id: settingsTabId,
      title: t('设置'),
      type: 'settings',
      network: networkMode.value
    })
    syncTabsToContentView()
  }
  switchTab(settingsTabId)
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.openSettingsTab, { targetTab: 'about' })
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
    // 更新设置 tab 的标题
    tabs.value.forEach(tab => {
      if (tab.type === 'settings') {
        tab.title = t('设置')
      }
    })
    syncTabsToContentView()
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.projectCreated, (data: { projectId: string, projectName: string }) => {
    const insertIndex = getProjectTabInsertIndex()
    tabs.value.splice(insertIndex, 0, { id: data.projectId, title: data.projectName, type: 'project', network: networkMode.value })
    activeTabId.value = data.projectId
    syncTabsToContentView()
    syncActiveTabToContentView()
    scrollToActiveTab()
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.projectChanged, (data: { projectId: string, projectName: string }) => {
    activeTabId.value = data.projectId;
    const matchedProject = tabs.value.find(t => t.id === data.projectId)
    if (!matchedProject) {
      const insertIndex = getProjectTabInsertIndex()
      tabs.value.splice(insertIndex, 0, { id: data.projectId, title: data.projectName, type: 'project', network: networkMode.value })
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

  window.electronAPI?.ipcManager.onMain(UPDATE_IPC_EVENTS.downloadProgress, (data: DownloadProgress) => {
    downloadState.percent = data.percent
  })

  window.electronAPI?.ipcManager.onMain(UPDATE_IPC_EVENTS.downloadStateChanged, (data: { state: DownloadState; error?: string }) => {
    downloadState.state = data.state
    if (data.state === 'completed' || data.state === 'cancelled' || data.state === 'error') {
      downloadState.percent = 0
    }
  })

  // 监听导航到首页事件
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.navigateToHome, () => {
    activeTabId.value = ''
    syncActiveTabToContentView()
  })
  // 监听导航到登录页事件（联网模式）
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.navigateToLogin, () => {
    activeTabId.value = 'login'
    syncActiveTabToContentView()
  })
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.activeTabUpdated, (nextActiveTabId: string) => {
    activeTabId.value = nextActiveTabId
    syncActiveTabToContentView()
    scrollToActiveTab()
  })

  // 监听来自 App.vue 的初始化数据
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.initTabsData, (data: { tabs: AppWorkbenchHeaderTab[], activeTabId: string, language: Language, networkMode: RuntimeNetworkMode }) => {
    tabs.value = data.tabs || [];
    activeTabId.value = data.activeTabId || '';
    language.value = data.language || 'zh-cn';
    skipNextNetworkModeWatch.value = true;
    const nextNetworkMode = data.networkMode || 'offline';
    if (nextNetworkMode === networkMode.value) {
      skipNextNetworkModeWatch.value = false;
    }
    networkMode.value = nextNetworkMode;
    changeLanguage(language.value);
    syncTabsToContentView();
    syncActiveTabToContentView();
    scrollToActiveTab();
  });

  // 监听网络模式变更
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.networkModeChanged, (mode: RuntimeNetworkMode) => {
    networkMode.value = mode;
  });

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.topBarToContent.appSettingsChanged, (data?: { appTitle: string, appLogo: string, appTheme: string, serverUrl?: string }) => {
    if (data) {
      appSettingsStore.updateFromIPC({
        appTitle: data.appTitle,
        appLogo: data.appLogo,
        appTheme: data.appTheme as unknown as import('@src/types').AppTheme,
        serverUrl: data?.serverUrl
      })
    } else {
      appSettingsStore.refreshSettings()
    }
    const { applyTheme } = useTheme()
    applyTheme(appSettingsStore.appTheme)
  });

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.userInfoChanged, (payload: Partial<PermissionUserInfo>) => {
    runtimeStore.updateUserInfo(payload)
  })

  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.apiflow.contentToTopBar.headerTabContextAction, (payload: AppWorkbenchHeaderTabContextActionPayload) => {
    handleHeaderTabContextAction(payload)
  })
}

// 处理document点击事件以关闭语言菜单
const handleDocumentClick = (event: MouseEvent) => {
  window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideHeaderTabContextmenu)
  if (languageButtonRef.value && !languageButtonRef.value.contains(event.target as Node)) {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideLanguageMenu)
  }
  if (userAvatarButtonRef.value && !userAvatarButtonRef.value.contains(event.target as Node)) {
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.hideUserMenu)
  }
}

// Web环境下监听localStorage变化以同步用户信息
const isElectronEnv = computed(() => {
  return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined'
})

const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'runtime/userInfo' && e.newValue) {
    try {
      const userInfo = JSON.parse(e.newValue)
      runtimeStore.updateUserInfo(userInfo)
    } catch (error) {
      console.error('Failed to parse userInfo from storage event:', error)
    }
  }
}

// Web环境下定时同步用户信息
let syncInterval: ReturnType<typeof setInterval> | null = null
const startSyncUserInfo = () => {
  if (!isElectronEnv.value) {
    syncInterval = setInterval(() => {
      runtimeStore.initUserInfo()
    }, 1000)
  }
}

onMounted(async () => {
  // 检测是否为商店版本
  if (isElectronEnv.value) {
    isAppStore.value = await window.electronAPI?.updateManager.isAppStore() || false
  }
  
  runtimeStore.initUserInfo()
  bindEvent()
  scrollToActiveTab()
  
  if (!isElectronEnv.value) {
    // Web环境：监听storage事件和定时同步
    window.addEventListener('storage', handleStorageChange)
    startSyncUserInfo()
  } else {
    // Electron环境：使用IPC通信
    await nextTick()
    window.electronAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.topBarToContent.topBarReady)
  }
  
  window.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleDocumentClick)
  if (!isElectronEnv.value) {
    window.removeEventListener('storage', handleStorageChange)
    if (syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
  }
})

watch(() => networkMode.value, (mode, prevMode) => {
  if (skipNextNetworkModeWatch.value) {
    skipNextNetworkModeWatch.value = false;
    return
  }
  if (mode !== prevMode) {
    activeTabId.value = ''
    syncActiveTabToContentView()
  }
})
</script>

<style lang="scss" scoped>
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
  flex: 0 0 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 10px;
  height: 35px;
  cursor: pointer;
  -webkit-app-region: no-drag;

  .iconfont {
    margin-top: 1px;
    font-size: 12px;
    margin-right: 3px;
  }
  .menu-icon {
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
  max-width: 60%;
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

.download-progress-btn {
  gap: 4px;
}

.download-percent {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
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
  // gap: 6px;
  font-size: 12px;
  transition: all 0.2s;
  -webkit-app-region: no-drag;
  flex-shrink: 0;
  border-radius: 3px;
  // margin-right: 8px;
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
  margin-right: 8px;
  border-right: 1px solid var(--bg-white-15);
  padding-right: 8px;
  -webkit-app-region: no-drag;

  .icon-btn {
    padding: 0;
    border: none;
    background: transparent;
    width: 25px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-white);
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s;
    flex-shrink: 0;
  }
  .icon-btn:hover {
    background-color: var(--bg-white-10);
  }
  .icon-btn:focus {
    outline: none;
    box-shadow: none;
  }
  .icon-btn svg {
    flex-shrink: 0;
  }
  .icon-btn-with-text {
    width: auto;
    padding: 0 8px;
    gap: 2px;
  }
  .icon-text {
    font-size: 10px;
    font-weight: 500;
    white-space: nowrap;
  }
  .user-avatar-img {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: block;
    object-fit: cover;
    background-color: transparent;
  }
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
  background-color: var(--color-window-close);
}

.sortable-ghost {
  opacity: 0.6;
}
</style>




