<template>
  <div class="common-settings-container">
    <div class="page-header">
      <h2>{{ $t('通用配置') }}</h2>
    </div>

    <CleanTabs v-model="activeTab" type="card" class="settings-tabs">
      <template #label-user>
        <div class="tab-label">
          <User :size="16" class="tab-label__icon" />
          <span>{{ $t('用户配置') }}</span>
        </div>
      </template>
      <template #label-app>
        <div class="tab-label">
          <AppWindow :size="16" class="tab-label__icon" />
          <span>{{ $t('应用配置') }}</span>
        </div>
      </template>

      <CleanTabPane name="user">
        <UserConfigPanel />
      </CleanTabPane>
      <CleanTabPane name="app">
        <AppConfigPanel />
      </CleanTabPane>
    </CleanTabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, AppWindow } from 'lucide-vue-next'
import { CleanTabs, CleanTabPane } from '@/components/ui/cleanDesign/tabs'
import UserConfigPanel from './userConfig/UserConfigPanel.vue'
import AppConfigPanel from './appConfig/AppConfigPanel.vue'

const activeTab = ref<'user' | 'app'>('user')
</script>

<style lang="scss" scoped>
.common-settings-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
  box-sizing: border-box;
  overflow-y: auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}
.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;

  &__icon {
    color: inherit;
  }
}
</style>
