<template>
  <div class="s-header">
    <div class="logo">
      <img src="@/assets/imgs/logo.png" alt="Apiflow Logo" class="logo-img" width="24" height="24" draggable="false" @click="jumpToHome"/>
    </div>
    <div class="home" :class="{ active: activeTabId === ''}" @click="jumpToHome">
      <i class="iconfont iconhome"></i>
      <span>{{ t('主页面') }}</span>
    </div>
    <div v-if="filteredTabs.length > 0" class="divider"></div>
    <div class="tabs">
      <draggable v-model="draggableTabs" class="tab-list" :animation="150" ghost-class="sortable-ghost"
        chosen-class="sortable-chosen" drag-class="sortable-drag" item-key="id">
        <template #item="{ element: tab }">
          <li :class="['tab-item', { active: tab.id === activeTabId }]" :title="tab.title" :data-id="tab.id" @click="switchTab(tab.id)">
            <FolderKanban v-if="tab.type === 'project'" class="tab-icon" :size="14" />
            <span>{{ tab.title }}</span>
            <span class="close-btn iconfont iconguanbi" @click.stop="deleteTab(tab.id)"></span>
          </li>
        </template>
      </draggable>
      <button class="add-tab-btn" :title="t('新建项目')" @click="handleAddProject">+</button>
    </div>
    <div class="right">
      <div class="navigation-control">
        <el-icon class="icon" size="16" :title="t('刷新主应用')" @click="refreshApp"><RefreshRight /></el-icon>
        <el-icon class="icon" size="16" :title="t('后退')" @click="goBack"><Back /></el-icon>
        <el-icon class="icon" size="16" :title="t('前进')" @click="goForward"><Right /></el-icon>
        <el-icon class="icon" size="16" :title="t('个人中心')" @click="jumpToUserCenter">
          <i class="iconfont icongerenzhongxin custom-icon"></i>
        </el-icon>
        <div class="icon" size="16" :title="t('切换语言')" @click="handleChangeLanguage" ref="languageButtonRef">
          <i class="iconfont iconyuyan custom-icon"></i>
          <span class="language-text">{{ currentLanguageDisplay }}</span>
        </div>
        <el-icon 
          size="16" 
          :title="networkMode === 'online' ? t('互联网模式') : t('离线模式')" 
          @click="toggleNetworkMode" 
          class="network-btn icon"
        >
          <i class="iconfont network-icon" :class="networkMode === 'online' ? 'iconwifi' : 'iconwifi-off-line'"></i>
          <span class="network-text">{{ networkMode === 'online' ? t('互联网模式') : t('离线模式') }}</span>
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
import { ref, onMounted, watch, computed } from 'vue'
import draggable from 'vuedraggable'
import { headerCache } from '@/cache/features/header/headerCache.ts'
import { Language, WindowState } from '@src/types'
import type { HeaderTab } from '@src/types/header'
import { RefreshRight, Back, Right } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { FolderKanban } from 'lucide-vue-next'
import { useRuntime } from '@/store/runtime/runtime'

const tabs = ref<HeaderTab[]>([])
const activeTabId = ref('')
const isMaximized = ref(false)
const { t } = useI18n()
const runtime = useRuntime()
const networkMode = computed(() => runtime.networkMode)
const filteredTabs = computed(() => {
  return tabs.value.filter(tab => tab.network === networkMode.value)
})
const draggableTabs = computed({
  get: () => tabs.value.filter(tab => tab.network === networkMode.value),
  set: (newTabs: HeaderTab[]) => {
    const otherNetworkTabs = tabs.value.filter(tab => tab.network !== networkMode.value)
    tabs.value = [...otherNetworkTabs, ...newTabs]
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

/*
|--------------------------------------------------------------------------
| 导航控制
|--------------------------------------------------------------------------
*/
const refreshApp = () => {
  window.electronAPI?.ipcManager.sendToMain('apiflow-refresh-app')
}

const goBack = () => {
  window.electronAPI?.ipcManager.sendToMain('apiflow-go-back')
}

const goForward = () => {
  window.electronAPI?.ipcManager.sendToMain('apiflow-go-forward')
}

/*
|--------------------------------------------------------------------------
| 语言切换
|--------------------------------------------------------------------------
*/
const currentLanguage = ref<Language>(localStorage.getItem('language') as Language || 'zh-cn')
const currentLanguageDisplay = computed(() => {
  const languageMap: Record<Language, string> = {
    'zh-cn': '中',
    'zh-tw': '繁',
    'en': 'EN',
    'ja': 'JP'
  }
  return languageMap[currentLanguage.value] || '中'
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
    window.electronAPI?.ipcManager.sendToMain('apiflow-show-language-menu', {
      position: buttonPosition,
      currentLanguage: currentLanguage.value
    })
  }
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
  const currentTab = tabs.value.find(t => t.id === tabId);
  if (!currentTab) return;
  if (currentTab.type === 'project') {
    window.electronAPI?.ipcManager.sendToMain('apiflow-topbar-switch-project', {
      projectId: tabId,
      projectName: currentTab.title
    })
  } else if (currentTab.type === 'settings') {
    window.electronAPI?.ipcManager.sendToMain('apiflow-topbar-navigate', '/user-center')
  }
}
/*
|--------------------------------------------------------------------------
| 其他
|--------------------------------------------------------------------------
*/
const jumpToHome = () => {
  activeTabId.value = '';
  window.electronAPI?.ipcManager.sendToMain('apiflow-topbar-navigate', '/home')
}
const jumpToUserCenter = () => {
  const userCenterTabId = 'user-center';
  const existingTab = tabs.value.find(t => t.id === userCenterTabId);
  if (!existingTab) {
    tabs.value.push({
      id: userCenterTabId,
      title: t('个人中心'),
      type: 'settings',
      network: networkMode.value
    });
  }
  switchTab(userCenterTabId);
}
const toggleNetworkMode = () => {
  const newMode = networkMode.value === 'online' ? 'offline' : 'online'
  runtime.setNetworkMode(newMode)
  window.electronAPI?.ipcManager.sendToMain('apiflow-network-mode-changed', newMode)
}
const handleAddProject = () => window.electronAPI?.ipcManager.sendToMain('apiflow-topbar-create-project')
// 绑定事件
const bindEvent = () => {
  window.electronAPI?.windowManager.onWindowResize(handleWindowResize)
  
  window.electronAPI?.windowManager.getWindowState().then((state) => {
    isMaximized.value = state.isMaximized
  })
  
  window.electronAPI?.ipcManager.onMain('apiflow-language-changed', (language: string) => {
    currentLanguage.value = language as Language
  })
  
  window.electronAPI?.ipcManager.onMain('apiflow-create-project-success', (data: { projectId: string, projectName: string }) => {
    tabs.value.push({ id: data.projectId, title: data.projectName, type: 'project', network: networkMode.value })
    activeTabId.value = data.projectId
  })
  
  window.electronAPI?.ipcManager.onMain('apiflow-change-project', (data: { projectId: string, projectName: string }) => {
    activeTabId.value = data.projectId;
    const matchedProject = tabs.value.find(t => t.id === data.projectId)
    if (!matchedProject) {
      tabs.value.push({ id: data.projectId, title: data.projectName, type: 'project', network: networkMode.value })
    } else if (matchedProject.title !== data.projectName) {
      matchedProject.title = data.projectName
    }
  })
  
  window.electronAPI?.ipcManager.onMain('apiflow-delete-project', (projectId: string) => {
    deleteTab(projectId)
  })
  
  window.electronAPI?.ipcManager.onMain('apiflow-change-project-name', (data: { projectId: string, projectName: string }) => {
    const index = tabs.value.findIndex(t => t.id === data.projectId)
    if (index !== -1) {
      tabs.value[index].title = data.projectName
    }
  })
  
  // 监听来自 App.vue 的初始化数据
  window.electronAPI?.ipcManager.onMain('apiflow-init-tabs-data', (data: { tabs: HeaderTab[], activeTabId: string }) => {
    tabs.value = data.tabs;
    activeTabId.value = data.activeTabId;
  });
}

onMounted(() => {
  bindEvent()
  // 发送就绪信号
  window.electronAPI?.ipcManager.sendToMain('apiflow-topbar-ready');
})

watch(() => networkMode.value, (mode, prevMode) => {
  if (mode !== prevMode) {
    activeTabId.value = ''
  }
})

watch(tabs, (val) => {
  headerCache.setHeaderTabs(val)
}, { deep: true })

watch(activeTabId, (val) => {
  headerCache.setHeaderActiveTab(val)
})
</script>

<style lang="scss">
:root {
  --apiflow-header-height: 35px;
  --white: #fff;
  --tab-bg: rgba(255, 255, 255, 0.08);
  --tab-active-bg: rgba(255, 255, 255, 0.40);
  --tab-hover-bg: rgba(255, 255, 255, 0.15);
  --tab-border: rgba(255, 255, 255, 0.1);
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
  background: linear-gradient(to right, #2c3e50, #3a4a5f);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  -webkit-app-region: drag;
  color: var(--white);
  padding: 0 0 0 20px;
  justify-content: space-between;
}
.logo {
  height: 100%;
  display: flex;
  -webkit-app-region: no-drag;
  align-items: center;
  margin-right: 20px;
}
.logo-img {
  height: 24px;
  width: 24px;
  border-radius: 50%;
  object-fit: cover;
  will-change: auto;
}

.home {
  display: flex;
  align-items: center;
  font-size: 12px;
  height: 35px;
  padding: 0 20px 0 15px;
  cursor: pointer;
  -webkit-app-region: no-drag;

  .iconfont {
    margin-top: 1px;
    font-size: 12px;
    margin-right: 3px;
  }
  &.active {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.35);
  }
  &:hover:not(.active) {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.1);
  }
}
.divider {
  width: 1px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.15);
}
.tabs {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.tabs::-webkit-scrollbar {
  display: none;
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
  padding: 0 30px 0 20px;
  max-width: 200px;
  display: flex;
  align-items: center;
  // background: var(--tab-bg);
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

.tab-item span:first-child {
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
  position: absolute;
  right: 0px;
  top: 53%;
  transform: translateY(-50%);
}

.tab-item:hover .close-btn,
.tab-item.active .close-btn {
  opacity: 1;
}

.tab-item:hover:not(.active) {
  background: var(--tab-hover-bg);
}

.tab-item.active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.35);
}

.tab-item .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.add-tab-btn {
  margin-left: 4px;
  padding: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  transition: all 0.2s;
  -webkit-app-region: no-drag;
}

.add-tab-btn:focus {
  outline: none;
  box-shadow: none;
}

.add-tab-btn:hover {
  background: var(--tab-hover-bg);
}

.right {
  height: 100%;
  display: flex;
  align-items: center;
  padding-right: 15px;
}

.navigation-control {
  display: flex;
  align-items: center;
  margin-right: 8px;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
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
      background-color: rgba(255, 255, 255, 0.1);
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
  color: var(--white);
}



.language-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
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
  background-color: rgba(255, 255, 255, 0.1);
}

.window-control .close:hover {
  background-color: #e81123;
}

.sortable-ghost {
  opacity: 0.6;
}
</style>




