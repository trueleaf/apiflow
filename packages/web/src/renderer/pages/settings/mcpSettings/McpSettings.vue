<template>
  <div class="mcp-settings" data-testid="settings-mcp-panel">
    <div class="page-header">
      <h2>{{ t('MCP 服务') }}</h2>
      <ElButton data-testid="mcp-refresh-status-btn" :loading="loading" @click="refreshStatus">
        {{ t('刷新状态') }}
      </ElButton>
    </div>

    <div class="settings-section">
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-title">{{ t('启用 MCP 服务') }}</div>
          <div class="setting-description">
            {{ t('开启后 Codex 等本地客户端可调用 ApiFlow 离线数据工具') }}
          </div>
        </div>
        <ElSwitch v-model="form.enabled" data-testid="mcp-enabled-switch" :disabled="saving" />
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-title">{{ t('MCP 端口') }}</div>
          <div class="setting-description">
            {{ t('端口固定使用，不会在占用时自动切换') }}
          </div>
        </div>
        <ElInputNumber v-model="form.port" data-testid="mcp-port-input" :min="1" :max="65535" :disabled="saving" />
      </div>

      <div class="actions">
        <ElButton data-testid="mcp-save-settings-btn" type="primary" :loading="saving" @click="saveSettings">
          {{ t('保存并重启服务') }}
        </ElButton>
        <ElButton data-testid="mcp-restart-service-btn" :loading="saving" @click="restartService">
          {{ t('重启服务') }}
        </ElButton>
      </div>
    </div>

    <div class="status-section">
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">{{ t('服务状态') }}</span>
          <ElTag data-testid="mcp-server-status" :type="serverStatusType">{{ serverStatusText }}</ElTag>
        </div>
        <div class="status-item">
          <span class="status-label">{{ t('Executor 状态') }}</span>
          <ElTag data-testid="mcp-executor-status" :type="executorStatusType">{{ executorStatusText }}</ElTag>
        </div>
        <div class="status-item endpoint-item">
          <span class="status-label">{{ t('连接地址') }}</span>
          <code data-testid="mcp-endpoint">{{ status.endpoint }}</code>
        </div>
      </div>

      <ElAlert
        v-if="status.errorMessage"
        class="status-alert"
        type="error"
        :title="status.errorCode"
        :description="status.errorMessage"
        show-icon
        :closable="false"
      />

      <ElAlert
        class="status-alert"
        type="info"
        :title="t('后台常驻说明')"
        :description="t('关闭窗口会隐藏到托盘，MCP 服务继续运行；只有托盘退出或系统结束进程后服务才会停止。')"
        show-icon
        :closable="false"
      />
    </div>

    <div class="config-section">
      <div class="section-title">{{ t('Codex 配置示例') }}</div>
      <pre><code data-testid="mcp-codex-config">{{ codexConfig }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from '@/helper'
import type { McpStatus } from '@src/types/mcp'

const { t } = useI18n()
const loading = ref(false)
const saving = ref(false)
const form = reactive({
  enabled: true,
  port: 34180,
})
const status = ref<McpStatus>({
  enabled: true,
  port: 34180,
  endpoint: 'http://127.0.0.1:34180/mcp',
  serverState: 'stopped',
  executorState: 'not-created',
  errorCode: '',
  errorMessage: '',
})
const syncForm = (nextStatus: McpStatus) => {
  status.value = nextStatus
  form.enabled = nextStatus.enabled
  form.port = nextStatus.port
}
const refreshStatus = async () => {
  loading.value = true
  try {
    const nextStatus = await window.electronAPI?.mcpManager.getStatus()
    if (nextStatus) {
      syncForm(nextStatus)
    }
  } finally {
    loading.value = false
  }
}
const saveSettings = async () => {
  saving.value = true
  try {
    const nextStatus = await window.electronAPI?.mcpManager.updateSettings({
      enabled: form.enabled,
      port: form.port,
    })
    if (nextStatus) {
      syncForm(nextStatus)
    }
    message.success(t('保存成功'))
  } finally {
    saving.value = false
  }
}
const restartService = async () => {
  saving.value = true
  try {
    const nextStatus = await window.electronAPI?.mcpManager.restart()
    if (nextStatus) {
      syncForm(nextStatus)
    }
    message.success(t('重启成功'))
  } finally {
    saving.value = false
  }
}
const serverStatusText = computed(() => {
  const statusTextMap = {
    stopped: t('已停止'),
    starting: t('启动中'),
    running: t('运行中'),
    error: t('异常'),
  }
  return statusTextMap[status.value.serverState]
})
const executorStatusText = computed(() => {
  const statusTextMap = {
    'not-created': t('未创建'),
    loading: t('加载中'),
    ready: t('已就绪'),
    error: t('异常'),
  }
  return statusTextMap[status.value.executorState]
})
const serverStatusType = computed(() => {
  if (status.value.serverState === 'running') {
    return 'success'
  }
  if (status.value.serverState === 'error') {
    return 'danger'
  }
  return 'info'
})
const executorStatusType = computed(() => {
  if (status.value.executorState === 'ready') {
    return 'success'
  }
  if (status.value.executorState === 'error') {
    return 'danger'
  }
  return 'info'
})
const codexConfig = computed(() => {
  return `[mcp_servers.apiflow]
url = "${status.value.endpoint}"
enabled = true`
})
onMounted(() => {
  refreshStatus()
})
</script>

<style lang="scss" scoped>
.mcp-settings {
  width: 100%;
  height: 100%;
  overflow: auto;
  color: var(--text-primary);

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
  }

  .settings-section,
  .status-section,
  .config-section {
    border: 1px solid var(--border-base);
    border-radius: 8px;
    background-color: var(--bg-primary);
    margin-bottom: 16px;
    padding: 18px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-light);

    &:last-of-type {
      border-bottom: none;
    }
  }

  .setting-info {
    min-width: 0;
  }

  .setting-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .setting-description {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 18px;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .status-item {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    background-color: var(--bg-secondary);
    border-radius: 6px;
  }

  .endpoint-item {
    grid-column: 1 / -1;
  }

  .status-label {
    color: var(--text-secondary);
    font-size: 13px;
    flex: none;
  }

  code {
    color: var(--text-primary);
    font-family: var(--font-family);
    word-break: break-all;
  }

  .status-alert {
    margin-top: 12px;
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  pre {
    margin: 0;
    padding: 14px;
    border-radius: 6px;
    background-color: var(--bg-secondary);
    overflow: auto;
  }
}
</style>
