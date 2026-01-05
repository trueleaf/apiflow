<template>
  <div class="settings">
    <div class="tab-container">
      <div class="vertical-tabs">
        <div class="sidebar-title">
          <span>{{ t('基本设置') }}</span>
        </div>

        <div class="menu-group">
          <div v-for="(tab, index) in tabs" :key="index" class="tab-item" :class="{ active: activeTab === tab.action }"
            :data-testid="`settings-menu-${tab.action}`" @click="handleTabClick(tab)">
            <component :is="tab.icon" class="tab-icon" />
            <span>{{ tab.name }}</span>
          </div>
        </div>

        <div class="sidebar-title sidebar-settings-title">
          <span>{{ t('其他设置') }}</span>
        </div>

        <div class="menu-group">
          <div
            v-for="(setting, index) in settingTabs"
            :key="index"
            class="tab-item"
            :class="{ active: activeTab === setting.action }"
            :data-testid="`settings-menu-${setting.action}`"
            @click="handleSettingClick(setting)"
          >
            <component :is="setting.icon" class="tab-icon" />
            <span>{{ setting.name }}</span>
            <span v-if="setting.action === 'about' && showUpdateBadge" class="update-badge"></span>
          </div>
        </div>
      </div>

      <div class="content-area">
        <CommonSettings v-if="activeTab === 'common-settings'" />
        <CacheManagement v-if="activeTab === 'local-data'" />
        <ProjectRecovery v-if="activeTab === 'project-recovery'" />
        <Shortcuts v-if="activeTab === 'shortcuts'" />
        <ComponentLibrary v-if="activeTab === 'components'" />
        <AiSettings v-if="activeTab === 'ai-settings'" />
        <TestCase v-if="activeTab === 'test-case'" />
        <About v-if="activeTab === 'about'" @update-badge="handleUpdateBadge" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { appStateCache } from '@/cache/appState/appStateCache.ts'
import CacheManagement from './cacheManager/CacheManagement.vue'
import CommonSettings from './commonSettings/CommonSettings.vue'
import ComponentLibrary from './componentLibrary/ComponentLibrary.vue'
import AiSettings from './aiSettings/AiSettings.vue'
import ProjectRecovery from './projectRecovery/ProjectRecovery.vue'
import Shortcuts from './shortcuts/Shortcuts.vue'
import TestCase from './testCase/TestCase.vue'
import About from './about/About.vue'
import { UserCircle, HardDrive, Command, Box, BrainCircuit, Trash2, FlaskConical, Info } from 'lucide-vue-next'

const { t } = useI18n()

type TabItem = {
  name: string
  icon: Component
  action: string
};

const activeTab = ref(appStateCache.getActiveLocalDataMenu() || 'common-settings')
const showUpdateBadge = ref(false)
const tabs = computed<TabItem[]>(() => [
  { name: t('通用配置'), icon: UserCircle, action: 'common-settings' },
  { name: t('本地数据'), icon: HardDrive, action: 'local-data' },
  { name: t('项目回收站'), icon: Trash2, action: 'project-recovery' }
])
const settingTabs = computed<TabItem[]>(() => [
  { name: t('快捷键'), icon: Command, action: 'shortcuts' },
  { name: t('组件库'), icon: Box, action: 'components' },
  { name: t('AI 设置'), icon: BrainCircuit, action: 'ai-settings' },
  { name: t('测试案例'), icon: FlaskConical, action: 'test-case' },
  { name: t('关于'), icon: Info, action: 'about' }
])
const handleSettingClick = (setting: TabItem) => {
  activeTab.value = setting.action
}
const handleTabClick = (tab: TabItem) => {
  activeTab.value = tab.action
}
const handleUpdateBadge = (show: boolean) => {
  showUpdateBadge.value = show
}
watch(activeTab, (newValue) => {
  appStateCache.setActiveLocalDataMenu(newValue)
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
      border-right: 1px solid var(--border-sidebar);
      background-color: var(--bg-sidebar);
      overflow-y: auto;

      .sidebar-title {
        padding: 15px 24px 5px;
        color: var(--text-secondary);
        font-size: 13px;

        &.sidebar-settings-title {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid var(--border-sidebar);
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
        color: var(--text-primary);

        &:hover {
          background-color: var(--bg-sidebar-item-hover);
        }

        &.active {
          background-color: var(--bg-sidebar-item-active);
          color: var(--el-color-primary);
          border-right: 3px solid var(--el-color-primary);
        }

        .tab-icon {
          margin-right: 10px;
          width: 18px;
          height: 18px;
        }

        .update-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--el-color-danger);
          box-shadow: 0 0 0 2px var(--bg-sidebar);
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
