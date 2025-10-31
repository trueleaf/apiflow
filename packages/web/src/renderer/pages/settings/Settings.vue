<template>
  <div class="settings">
    <div class="tab-container">
      <div class="vertical-tabs">
        <div class="sidebar-title">
          <span>基本设置</span>
        </div>

        <div class="menu-group">
          <div v-for="(tab, index) in tabs" :key="index" class="tab-item" :class="{ active: activeTab === tab.action }"
            @click="handleTabClick(tab)">
            <component :is="tab.icon" class="tab-icon" />
            <span>{{ tab.name }}</span>
          </div>
        </div>

        <div class="sidebar-title sidebar-settings-title">
          <span>其他设置</span>
        </div>

        <div class="menu-group">
          <div 
            v-for="(setting, index) in settingTabs" 
            :key="index" 
            class="tab-item"
            :class="{ active: activeTab === setting.action }"
            @click="handleSettingClick(setting)"
          >
            <component :is="setting.icon" class="tab-icon" />
            <span>{{ setting.name }}</span>
          </div>
        </div>
      </div>

      <div class="content-area">
        <UserInfo v-if="activeTab === 'user-info'" />
        <CacheManagement v-if="activeTab === 'local-data'" />
        <ComponentLibrary v-if="activeTab === 'components'" />
        <AiSettings v-if="activeTab === 'ai-settings'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Component } from 'vue'
import { userState } from '@/cache/userState/userStateCache.ts'
import CacheManagement from './cacheManager/CacheManagement.vue'
import UserInfo from './userInfo/UserInfo.vue'
import ComponentLibrary from './componentLibrary/ComponentLibrary.vue'
import AiSettings from './aiSettings/AiSettings.vue'
import { UserCircle, HardDrive, Settings, Command, Box, BrainCircuit } from 'lucide-vue-next'

type TabItem = {
  name: string
  icon: Component
  action: string
};

const activeTab = ref(userState.getActiveLocalDataMenu() || 'user-info')
const tabs: TabItem[] = [
  { name: '基本信息', icon: UserCircle, action: 'user-info' },
  { name: '本地数据', icon: HardDrive, action: 'local-data' }
]
const settingTabs: TabItem[] = [
  { name: '通用', icon: Settings, action: 'general' },
  { name: '快捷键', icon: Command, action: 'shortcuts' },
  { name: '组件库', icon: Box, action: 'components' },
  { name: 'AI 设置', icon: BrainCircuit, action: 'ai-settings' }
]
const handleSettingClick = (setting: TabItem) => {
  activeTab.value = setting.action
}
const handleTabClick = (tab: TabItem) => {
  activeTab.value = tab.action
}
watch(activeTab, (newValue) => {
  userState.setActiveLocalDataMenu(newValue)
}, { immediate: false })
</script>

<style lang="scss" scoped>
.settings {
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

        .tab-icon {
          margin-right: 10px;
          width: 18px;
          height: 18px;
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
