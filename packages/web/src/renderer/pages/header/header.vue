<template>
  <div class="s-header">
    <div class="logo">
      <span class="app-title" @click="jumpToHome">
        <span>{{ appTitle }}</span>
        <span v-if="isDev" id="devIndicator">(本地)</span>
      </span>
    </div>
    <div class="home" :class="{ active: activeTabId === '' }" @click="jumpToHome">
      <i class="iconfont iconhome"></i>
      <span>主页面</span>
    </div>
    <el-divider direction="vertical" class="divider" />
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
      <button class="add-tab-btn" title="新建项目" @click="handleAddProject">+</button>
    </div>
    <div class="right">
      <div class="window-control">
        <i class="iconfont iconjianhao" id="minimize" title="最小化" @click="minimize"></i>
        <i v-if="!isMaximized" class="iconfont iconmaxScreen" id="maximize" title="最大化" @click="maximize"></i>
        <i v-if="isMaximized" class="iconfont iconminiScreen" id="unmaximize" title="取消最大化" @click="unmaximize"></i>
        <i class="iconfont iconguanbi close" id="close" title="关闭" @click="close"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WindowState } from '@src/types/types';
import { ref, onMounted, nextTick, watch } from 'vue'
import draggable from 'vuedraggable'
import { apidocCache } from '@src/renderer/cache/apidoc'

const tabs = ref<{ id: string; title: string }[]>([])
const activeTabId = ref('')
const isMaximized = ref(false)
const isDev = ref(false)
const appTitle = ref('Apiflow')
const tabListRef = ref<HTMLElement>()
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
| tabs操作
|--------------------------------------------------------------------------
 */
const deleteTab = (tabId: string) => {
  const index = tabs.value.findIndex(t => t.id === tabId)
  if (index === -1) return
  tabs.value = tabs.value.filter(t => t.id !== tabId)
  if (activeTabId.value === tabId && tabs.value.length) {
    activeTabId.value = tabs.value[Math.min(index, tabs.value.length - 1)]?.id || ''
  }
}
const switchTab = (projectId: string) => {
  activeTabId.value = projectId;
  window.electronAPI?.sendToMain('apiflow-topbar-switch-project', {
    projectId: projectId,
    projectName: tabs.value.find(t => t.id === projectId)?.title || ''
  })
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
  // 主进程期望接收字符串路径，不是对象
  window.electronAPI?.sendToMain('apiflow-topbar-navigate', '/')
}
const bindAppEvent = () => {
  window.electronAPI?.onMain('apiflow-create-project-success', (data: { projectId: string, projectName: string }) => {
    tabs.value.push({ id: data.projectId, title: data.projectName })
    activeTabId.value = data.projectId
    nextTick(() => { tabListRef.value && (tabListRef.value.scrollLeft = tabListRef.value.scrollWidth) })
  })
  window.electronAPI?.onMain('apiflow-change-project', (data: { projectId: string, projectName: string }) => {
    activeTabId.value = data.projectId;
    if (!tabs.value.find(t => t.id === data.projectId)) {
      tabs.value.push({ id: data.projectId, title: data.projectName })
    }
  })
  // 主进程发送的事件名称：apiflow-delete-project
  window.electronAPI?.onMain('apiflow-delete-project', (projectId: string) => {
    deleteTab(projectId)
  })
  // 主进程发送的事件名称：apiflow-change-project-name
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
  // 恢复 tabs 和激活 tab
  tabs.value = apidocCache.getHeaderTabs()
  activeTabId.value = apidocCache.getHeaderActiveTab()
})

watch(tabs, (val) => {
  apidocCache.setHeaderTabs(val)
}, { deep: true })

watch(activeTabId, (val) => {
  apidocCache.setHeaderActiveTab(val)
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
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  height: 0.9em;
  margin-top: 3px;
  
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
  width: 150px;
  height: 100%;
  display: flex;
  align-items: center;
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