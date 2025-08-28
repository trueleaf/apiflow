<template>
  <div class="s-header">
    <div class="logo">
      <span class="app-title" @click="jumpToHome">
        <span>{{ appTitle }}</span>
        <span v-if="isDev" id="devIndicator">({{ $t('本地') }})</span>
      </span>
    </div>
    <div class="home" :class="{ active: activeTabId === ''}" @click="jumpToHome">
      <i class="iconfont iconhome"></i>
      <span>{{ $t('主页面') }}</span>
    </div>
    <div v-if="tabs.length > 0" class="divider"></div>
    <div class="tabs">
      <draggable v-model="tabs" class="tab-list" :animation="150" ghost-class="sortable-ghost"
        chosen-class="sortable-chosen" drag-class="sortable-drag" @end="onDragEnd" item-key="id">
        <template #item="{ element: tab }">
          <li :class="['tab-item', { active: tab.id === activeTabId }]" :title="tab.title" :data-id="tab.id" @click="switchTab(tab.id)">
            <span>{{ tab.title }}</span>
            <span class="close-btn iconfont iconguanbi" @click.stop="deleteTab(tab.id)"></span>
          </li>
        </template>
      </draggable>
      <button class="add-tab-btn" :title="$t('新建项目')" @click="handleAddProject">+</button>
    </div>
    <div class="right">
      <div class="navigation-control">
        <el-icon size="18" :title="$t('刷新主应用')" @click="refreshApp"><RefreshRight /></el-icon>
        <el-icon size="18" :title="$t('后退')" @click="goBack"><Back /></el-icon>
        <el-icon size="18" :title="$t('前进')" @click="goForward"><Right /></el-icon>
        <el-icon size="18" :title="$t('个人中心')" @click="jumpToUserCenter"><i class="iconfont icongerenzhongxin"></i></el-icon>
        <div class="language-btn" :title="$t('切换语言')" @click="handleLanguageButtonClick" ref="languageButtonRef">
          <i class="iconfont iconyuyan"></i>
          <span class="language-text">{{ currentLanguageDisplay }}</span>
        </div>
      </div>
      <div class="window-control">
        <i class="iconfont iconjianhao" id="minimize" :title="$t('最小化')" @click="minimize"></i>
        <i v-if="!isMaximized" class="iconfont iconmaxScreen" id="maximize" :title="$t('最大化')" @click="maximize"></i>
        <i v-if="isMaximized" class="iconfont iconminiScreen" id="unmaximize" :title="$t('取消最大化')" @click="unmaximize"></i>
        <i class="iconfont iconguanbi close" id="close" :title="$t('关闭')" @click="close"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WindowState } from '@src/types/types';
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import draggable from 'vuedraggable'
import { httpNodeCache } from '@/cache/httpNode'
import { Language } from '@src/types'
import { RefreshRight, Back, Right } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

// 定义Tab类型
interface HeaderTab {
  id: string;
  title: string;
  type: 'project' | 'settings';
}

const tabs = ref<HeaderTab[]>([])
const activeTabId = ref('')
const isMaximized = ref(false)
const isDev = ref(false)
const appTitle = ref('Apiflow')
const tabListRef = ref<HTMLElement>()
const { t: $t } = useI18n()
/*
|--------------------------------------------------------------------------
| 窗口控制
|--------------------------------------------------------------------------
*/
const minimize = () => window.electronAPI?.minimize()
const maximize = () => window.electronAPI?.maximize()
const unmaximize = () => window.electronAPI?.unmaximize()
const close = () => window.electronAPI?.close()
const handleWindowResize = (state: WindowState) => {
  isMaximized.value = state.isMaximized
}

/*
|--------------------------------------------------------------------------
| 导航控制
|--------------------------------------------------------------------------
*/
const refreshApp = () => {
  window.electronAPI?.sendToMain('apiflow-refresh-app')
}

const goBack = () => {
  window.electronAPI?.sendToMain('apiflow-go-back')
}

const goForward = () => {
  window.electronAPI?.sendToMain('apiflow-go-forward')
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

const handleLanguageButtonClick = () => {
  if (languageButtonRef.value) {
    const rect = languageButtonRef.value.getBoundingClientRect()
    const buttonPosition = {
      x: rect.left,
      y: 0,
      width: rect.width,
      height: rect.height
    }

    // 发送显示语言菜单事件到主进程，包含按钮位置信息
    window.electronAPI?.sendToMain('apiflow-show-language-menu', {
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

  // 记录当前激活的tab，用于智能切换
  const wasActive = activeTabId.value === tabId;

  // 删除指定的标签页
  tabs.value = tabs.value.filter(t => t.id !== tabId)

  // 检查删除后的标签页数量
  if (tabs.value.length === 0) {
    // 如果没有剩余标签页，自动跳转到主页面
    jumpToHome()
  } else if (wasActive) {
    // 如果删除的是当前激活的标签页，智能选择下一个tab
    let newActiveTabId = '';

    // 优先选择右侧相邻的tab，如果没有则选择左侧的
    if (index < tabs.value.length) {
      newActiveTabId = tabs.value[index].id;
    } else if (index > 0) {
      newActiveTabId = tabs.value[index - 1].id;
    } else if (tabs.value.length > 0) {
      newActiveTabId = tabs.value[0].id;
    }

    if (newActiveTabId) {
      // 调用switchTab方法来正确切换到新的tab并触发相应的页面切换逻辑
      switchTab(newActiveTabId)
    }
  }
}
const switchTab = (tabId: string) => {
  activeTabId.value = tabId;
  const currentTab = tabs.value.find(t => t.id === tabId);

  if (!currentTab) return;

  if (currentTab.type === 'project') {
    // 项目类型tab：发送项目切换事件
    window.electronAPI?.sendToMain('apiflow-topbar-switch-project', {
      projectId: tabId,
      projectName: currentTab.title
    })
  } else if (currentTab.type === 'settings') {
    // 设置类型tab：发送路由跳转事件
    window.electronAPI?.sendToMain('apiflow-topbar-navigate', '/user-center')
  }
}
const onDragEnd = () => { }
/*
|--------------------------------------------------------------------------
| 新增项目
|--------------------------------------------------------------------------
*/
const handleAddProject = () => window.electronAPI?.sendToMain('apiflow-topbar-create-project')

const jumpToHome = () => {
  activeTabId.value = '';
  window.electronAPI?.sendToMain('apiflow-topbar-navigate', '/v1/apidoc/doc-list')
}

const jumpToUserCenter = () => {
  const userCenterTabId = 'user-center';
  const existingTab = tabs.value.find(t => t.id === userCenterTabId);
  if (!existingTab) {
    tabs.value.push({
      id: userCenterTabId,
      title: $t('个人中心'),
      type: 'settings'
    });
  }
  switchTab(userCenterTabId);
}
const bindAppEvent = () => {
  window.electronAPI?.onMain('apiflow-create-project-success', (data: { projectId: string, projectName: string }) => {
    tabs.value.push({ id: data.projectId, title: data.projectName, type: 'project' })
    activeTabId.value = data.projectId
    nextTick(() => { tabListRef.value && (tabListRef.value.scrollLeft = tabListRef.value.scrollWidth) })
  })
  window.electronAPI?.onMain('apiflow-change-project', (data: { projectId: string, projectName: string }) => {
    activeTabId.value = data.projectId;
    const matchedProject = tabs.value.find(t => t.id === data.projectId)
    if (!matchedProject) {
      tabs.value.push({ id: data.projectId, title: data.projectName, type: 'project' })
    } else if (matchedProject.title !== data.projectName) {
      matchedProject.title = data.projectName
    }
  })
  window.electronAPI?.onMain('apiflow-delete-project', (projectId: string) => {
    deleteTab(projectId)
  })
  window.electronAPI?.onMain('apiflow-change-project-name', (data: { projectId: string, projectName: string }) => {
    const index = tabs.value.findIndex(t => t.id === data.projectId)
    if (index !== -1) {
      tabs.value[index].title = data.projectName
    }
  })
  
}


onMounted(() => {
  window.electronAPI?.onWindowResize(handleWindowResize)
  bindAppEvent()
  window.electronAPI?.getWindowState().then((state) => {
    isMaximized.value = state.isMaximized
  })
  tabs.value = httpNodeCache.getHeaderTabs();
  activeTabId.value = httpNodeCache.getHeaderActiveTab();
  if (!activeTabId.value) { //如果没有缓存数据则跳转到主页
    window.electronAPI?.sendToMain('apiflow-topbar-navigate', '/v1/apidoc/doc-list')
  }
  // 监听语言切换事件
  window.electronAPI?.onMain('apiflow-language-changed', (language: string) => {
    currentLanguage.value = language as Language
  })
})

watch(tabs, (val) => {
  httpNodeCache.setHeaderTabs(val)
}, { deep: true })

watch(activeTabId, (val) => {
  httpNodeCache.setHeaderActiveTab(val)
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
  width: 80px;
  height: 100%;
  color: #ccc;
  display: flex;
  -webkit-app-region: no-drag;
  align-items: center;
}
.home {
  display: flex;
  align-items: center;
  font-size: 12px;
  height: 35px;
  padding: 0 15px;
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
  &:hover {
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
  padding: 0 24px 0 24px;
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

.tab-item:hover .close-btn {
  opacity: 1;
}

.tab-item:hover {
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
}

.navigation-control i {
  width: 32px;
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
}

.navigation-control i:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.language-btn {
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