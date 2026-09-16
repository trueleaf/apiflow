<template>
  <div class="mcp-settings" data-testid="settings-mcp-panel">
    <header class="page-header">
      <div class="header-title">
        <div class="header-icon">
          <Cable :size="20" />
        </div>
        <div>
          <span class="eyebrow">{{ t('本机 MCP 服务') }}</span>
          <h2>{{ t('MCP 服务') }}</h2>
          <p>{{ t('此配置会影响本机所有项目') }}</p>
        </div>
      </div>
      <ElButton circle data-testid="mcp-refresh-status-btn" :loading="loading" :title="t('刷新状态')" @click="refreshStatus">
        <RefreshCw :size="16" />
      </ElButton>
    </header>
    <section class="service-card">
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-title">{{ t('启用 MCP 服务') }}</div>
          <div class="setting-description">{{ t('开启后 Codex 等本地客户端可调用 ApiFlow 离线数据工具') }}</div>
        </div>
        <ElSwitch v-model="form.enabled" data-testid="mcp-enabled-switch" :disabled="saving" />
      </div>
      <div class="setting-row port-row">
        <div class="setting-info">
          <div class="setting-title">{{ t('MCP 端口') }}</div>
          <div class="setting-description">{{ t('端口固定使用，不会在占用时自动切换') }}</div>
        </div>
        <ElInputNumber v-model="form.port" data-testid="mcp-port-input" :min="1" :max="65535" :disabled="saving" controls-position="right" />
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-title">{{ t('MCP 只读模式') }}</div>
          <div class="setting-description">{{ t('只允许查询项目和接口数据，禁止创建、修改和删除') }}</div>
        </div>
        <ElSwitch v-model="form.readOnly" data-testid="mcp-readonly-switch" :disabled="saving" />
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-title">{{ t('允许 MCP 删除和覆盖数据') }}</div>
          <div class="setting-description">{{ t('启用后，删除和整体替换操作仍需客户端明确确认') }}</div>
        </div>
        <ElSwitch v-model="form.allowDestructive" data-testid="mcp-destructive-switch" :disabled="saving || form.readOnly" />
      </div>
      <div class="actions">
        <ElButton data-testid="mcp-save-settings-btn" type="primary" :loading="saving" @click="saveSettings">
          {{ t('保存并重启服务') }}
        </ElButton>
        <ElButton data-testid="mcp-restart-service-btn" :loading="saving" @click="restartService">
          {{ t('重启服务') }}
        </ElButton>
      </div>
    </section>
    <section class="overview-grid">
      <div class="status-card">
        <span>{{ t('服务状态') }}</span>
        <ElTag data-testid="mcp-server-status" :type="serverStatusType" effect="plain">{{ serverStatusText }}</ElTag>
      </div>
      <div class="status-card">
        <span>{{ t('本地数据访问状态') }}</span>
        <ElTag data-testid="mcp-executor-status" :type="executorStatusType" effect="plain">{{ executorStatusText }}</ElTag>
      </div>
    </section>
    <section class="endpoint-card">
      <div class="section-heading">
        <div>
          <span class="eyebrow">{{ t('连接地址') }}</span>
          <code data-testid="mcp-endpoint">{{ status.endpoint }}</code>
        </div>
        <ElButton circle data-testid="mcp-copy-endpoint-btn" :title="t('复制')" @click="copyText(status.endpoint)">
          <Copy :size="16" />
        </ElButton>
      </div>
    </section>
    <section class="config-card">
      <div class="section-heading">
        <div>
          <span class="eyebrow">{{ t('Codex 配置示例') }}</span>
          <p>{{ t('开启后 Codex 等本地客户端可调用 ApiFlow 离线数据工具') }}</p>
        </div>
        <ElButton circle data-testid="mcp-copy-codex-config-btn" :title="t('复制')" @click="copyText(codexConfig)">
          <Copy :size="16" />
        </ElButton>
      </div>
      <pre><code data-testid="mcp-codex-config">{{ displayedCodexConfig }}</code></pre>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-title">{{ t('MCP 访问令牌') }}</div>
          <div class="setting-description">{{ t('连接需要访问令牌，复制配置时会自动包含令牌，请勿公开分享') }}</div>
        </div>
        <ElButton :disabled="!status.authToken" @click="copyText(status.authToken)">{{ t('复制访问令牌') }}</ElButton>
      </div>
    </section>
    <div v-if="status.errorMessage" class="notice error-notice">
      <CircleAlert :size="18" />
      <div>
        <strong>{{ status.errorCode }}</strong>
        <p>{{ status.errorMessage }}</p>
      </div>
    </div>
    <div class="notice">
      <CircleAlert :size="18" />
      <div>
        <strong>{{ t('后台常驻说明') }}</strong>
        <p>{{ t('关闭窗口会隐藏到托盘，MCP 服务继续运行；只有托盘退出或系统结束进程后服务才会停止。') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Cable, CircleAlert, Copy, RefreshCw } from 'lucide-vue-next'
import { message } from '@/helper'
import type { McpStatus } from '@src/types/mcp'

const { t } = useI18n()
const loading = ref(false)
const saving = ref(false)
const form = reactive({
  enabled: true,
  port: 34180,
  readOnly: false,
  allowDestructive: false,
})
const status = ref<McpStatus>({
  enabled: true,
  port: 34180,
  endpoint: 'http://127.0.0.1:34180/mcp',
  serverState: 'stopped',
  executorState: 'not-created',
  errorCode: '',
  errorMessage: '',
  readOnly: false,
  allowDestructive: false,
  authToken: '',
})
const syncForm = (nextStatus: McpStatus) => {
  status.value = nextStatus
  form.enabled = nextStatus.enabled
  form.port = nextStatus.port
  form.readOnly = nextStatus.readOnly
  form.allowDestructive = nextStatus.allowDestructive
}
const refreshStatus = async () => {
  loading.value = true
  try {
    const nextStatus = await window.electronAPI?.mcpManager.getStatus()
    if (nextStatus) {
      syncForm(nextStatus)
    }
  } catch (error) {
    message.error(error instanceof Error ? error.message : t('MCP 操作失败'))
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
      readOnly: form.readOnly,
      allowDestructive: form.allowDestructive,
    })
    if (!nextStatus) throw new Error(t('MCP 操作失败'))
    syncForm(nextStatus)
    if (nextStatus.serverState === 'error') message.error(nextStatus.errorMessage)
    else message.success(t('保存成功'))
  } catch (error) {
    message.error(error instanceof Error ? error.message : t('MCP 操作失败'))
  } finally {
    saving.value = false
  }
}
const restartService = async () => {
  saving.value = true
  try {
    const nextStatus = await window.electronAPI?.mcpManager.restart()
    if (!nextStatus) throw new Error(t('MCP 操作失败'))
    syncForm(nextStatus)
    if (nextStatus.serverState === 'error') message.error(nextStatus.errorMessage)
    else message.success(t('重启成功'))
  } catch (error) {
    message.error(error instanceof Error ? error.message : t('MCP 操作失败'))
  } finally {
    saving.value = false
  }
}
// 复制 MCP 配置文本
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success(t('复制成功'))
  } catch {
    message.error(t('复制失败'))
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
    'not-created': t('未启动'),
    loading: t('准备中'),
    ready: t('可用'),
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
http_headers = { Authorization = "Bearer ${status.value.authToken}" }
enabled = true`
})
const displayedCodexConfig = computed(() => status.value.authToken ? codexConfig.value.replace(status.value.authToken, '<TOKEN>') : codexConfig.value)
onMounted(() => {
  refreshStatus()
})
</script>

<style lang="scss" scoped>
.mcp-settings {
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 32px;
  overflow: auto;
  color: var(--text-primary);
}
.page-header,
.header-title,
.setting-row,
.actions,
.overview-grid,
.status-card,
.section-heading,
.notice {
  display: flex;
}
.page-header,
.setting-row,
.status-card,
.section-heading {
  align-items: center;
  justify-content: space-between;
}
.page-header {
  gap: 24px;
  margin-bottom: 28px;
}
.header-title {
  align-items: flex-start;
  gap: 12px;
}
.header-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  color: #4a78d1;
  background-color: #edf3ff;
  border-radius: 10px;
}
.eyebrow {
  display: block;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.5;
}
h2,
p {
  margin: 0;
}
h2 {
  margin-top: 2px;
  font-size: 24px;
  line-height: 1.35;
}
.header-title p,
.config-card p,
.notice p {
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
.service-card,
.endpoint-card,
.config-card,
.notice {
  border: 1px solid var(--border-base);
  border-radius: 10px;
  background-color: var(--bg-primary);
}
.service-card,
.endpoint-card,
.config-card {
  padding: 20px;
}
.setting-row {
  gap: 24px;
  padding: 14px 0;
}
.port-row {
  border-top: 1px solid var(--border-light);
}
.setting-info {
  min-width: 0;
}
.setting-title {
  font-size: 14px;
  font-weight: 600;
}
.setting-description {
  margin-top: 5px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
.actions {
  gap: 10px;
  margin-top: 16px;
}
.overview-grid {
  gap: 12px;
  margin: 12px 0;
}
.status-card {
  flex: 1;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border-base);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  background-color: var(--bg-primary);
}
.endpoint-card,
.config-card {
  margin-top: 12px;
}
.section-heading {
  gap: 16px;
}
code,
pre {
  font-family: var(--font-family);
}
.endpoint-card code {
  display: block;
  margin-top: 5px;
  color: var(--text-primary);
  font-size: 13px;
  word-break: break-all;
}
pre {
  margin: 16px 0 0;
  padding: 14px;
  overflow: auto;
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.6;
}
.notice {
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
  padding: 14px 16px;
  color: var(--text-secondary);
  font-size: 13px;
}
.notice > svg {
  flex: none;
  margin-top: 2px;
  color: #4a78d1;
}
.notice strong {
  color: var(--text-primary);
  font-weight: 600;
}
.error-notice {
  border-color: #f0c6cb;
  background-color: #fff7f8;
}
.error-notice > svg,
.error-notice strong {
  color: #d95d68;
}
@media (max-width: 640px) {
  .mcp-settings {
    padding: 20px;
  }
  .overview-grid {
    flex-direction: column;
  }
  .setting-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
