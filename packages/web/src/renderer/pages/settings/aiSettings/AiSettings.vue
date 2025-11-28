<template>
  <div class="ai-settings-container">
    <div class="page-header">
      <h2>{{ $t('AI 设置') }}</h2>
    </div>
    <div class="ai-settings-content">
      <div class="config-section">
        <ProviderConfigPanel />
      </div>
      <div class="debug-section">
        <DebugPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProviderConfigPanel from './ConfigPanel.vue'
import DebugPanel from './DebugPanel.vue'
</script>

<style lang="scss" scoped>
.ai-settings-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
  box-sizing: border-box;
  overflow: hidden;

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

.ai-settings-content {
  flex: 1;
  display: flex;
  gap: 24px;
  min-height: 0;
}

.config-section {
  flex: 1;
  min-width: 0;
}

.debug-section {
  flex: 1;
  min-width: 0;
}
</style>