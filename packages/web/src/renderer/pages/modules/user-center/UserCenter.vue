<template>
  <div class="user-center">
    <div class="tab-container">
      <div class="vertical-tabs">
        <div class="sidebar-title">
          <span>账号信息</span>
        </div>

        <div class="menu-group">
          <div v-for="(tab, index) in tabs" :key="index" class="tab-item" :class="{ active: activeTab === tab.action }"
            @click="handleTabClick(tab)">
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </div>
        </div>

        <div class="sidebar-title sidebar-settings-title">
          <span>偏好设置</span>
        </div>

        <div class="menu-group">
          <div 
            v-for="(setting, index) in settingTabs" 
            :key="index" 
            class="tab-item"
            :class="{ active: activeTab === setting.action }"
            @click="handleSettingClick(setting)"
          >
            <i :class="setting.icon"></i>
            <span>{{ setting.name }}</span>
          </div>
        </div>
      </div>

      <div class="content-area">
        <UserInfo v-if="activeTab === 'user-info'" />
        <CacheManagement v-if="activeTab === 'local-data'" />
        <ComponentLibrary v-if="activeTab === 'components'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { httpNodeCache } from '@/cache/http/httpNode'
import CacheManagement from './cacheManager/CacheManagement.vue'
import UserInfo from './userInfo/UserInfo.vue'
import ComponentLibrary from './componentLibrary/ComponentLibrary.vue'

// 定义标签类型接口
interface TabItem {
  name: string
  icon: string
  action: string
}

// 初始化时从缓存中获取活跃标签，默认为 'user-info'
const activeTab = ref(httpNodeCache.getActiveLocalDataMenu() || 'user-info')
const tabs: TabItem[] = [
  { name: '基本信息', icon: 'iconfont icongerenzhongxin', action: 'user-info' },
  { name: '本地数据', icon: 'iconfont iconcipan', action: 'local-data' }
]

// 偏好设置选项
const settingTabs: TabItem[] = [
  { name: '通用', icon: 'iconfont iconCookies', action: 'general' },
  { name: '快捷键', icon: 'iconfont iconCookies', action: 'shortcuts' },
  { name: '组件库', icon: 'iconfont iconzujian', action: 'components' }
]

// 处理所有标签点击
const handleSettingClick = (setting: TabItem) => {
  activeTab.value = setting.action
}

// 处理基本信息标签点击
const handleTabClick = (tab: TabItem) => {
  activeTab.value = tab.action
}

// 监听 activeTab 变化，自动保存到缓存
watch(activeTab, (newValue) => {
  httpNodeCache.setActiveLocalDataMenu(newValue)
}, { immediate: false })
</script>

<style lang="scss" scoped>
.user-center {
  display: flex;
  height: 100%;
  width: 100%;

  .tab-container {
    display: flex;
    height: 100%;
    width: 100%;

    .vertical-tabs {
      width: 240px;
      height: 100%;
      border-right: 1px solid #eee;
      background-color: #ffffff;
      overflow-y: auto;

      .sidebar-title {
        padding: 15px 24px 5px;
        color: #909399;
        font-size: 13px;

        &.sidebar-settings-title {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
      }

      .menu-group {
        margin-bottom: 10px;
      }

      .tab-item {
        padding: 12px 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background-color 0.3s ease;
        position: relative;

        &:hover {
          background-color: #f5f5f5;
        }

        &.active {
          background-color: rgba(0, 122, 255, 0.1);
          color: #007aff;
          border-right: 3px solid #007aff;
        }

        i {
          margin-right: 10px;
          font-size: 18px;
        }
      }
    }

    .content-area {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}

// Transition effects
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
