<template>
  <div class="ai-config-view">
    <div class="ai-config-header">
      <button class="ai-back-btn" type="button" @click="agentViewStore.backToChat()">
        <ArrowLeft :size="16" /><span>{{ t('返回') }}</span>
      </button>
    </div>
    <div class="ai-config-content">
      <LLMConfigForm compact>
        <template #footer>
          <el-button class="ai-config-btn" @click="handleGoToFullSettings">{{ t('更多设置') }}<ArrowRight :size="14" /></el-button>
        </template>
      </LLMConfigForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { IPC_EVENTS } from '@src/types/ipc'
import { appStateCache } from '@/cache/appState/appStateCache'
import { useAgentViewStore } from '@/store/ai/agentView'
import LLMConfigForm from '@/components/common/llmConfig/LLMConfigForm.vue'
const { t } = useI18n()
const router = useRouter()
const agentViewStore = useAgentViewStore()
// 跳转完整设置页
const handleGoToFullSettings = () => {
  appStateCache.setActiveLocalDataMenu('ai-settings')
  agentViewStore.agentViewDialogVisible = false
  window.desktopAPI?.ipcManager.sendToMain(IPC_EVENTS.apiflow.contentToTopBar.openSettingsTab)
  router.push('/settings')
}
</script>

<style scoped>
.ai-config-view { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.ai-config-header { padding: 8px 16px; border-bottom: 1px solid var(--ai-header-border); }
.ai-back-btn { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border: none; border-radius: 4px; background: transparent; color: var(--ai-text-secondary); cursor: pointer; }
.ai-back-btn:hover { background: var(--ai-action-hover-bg); color: var(--ai-text-primary); }
.ai-config-content { flex: 1; padding: 20px; min-height: 0; }
</style>
