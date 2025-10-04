<template>
  <div class="log-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="toolbar-title">日志管理</div>
        <div class="toolbar-meta" v-if="lastFetchedAt">
          最近刷新：{{ formatTimestamp(lastFetchedAt) }}
        </div>
      </div>
      <div class="toolbar-actions">
        <div class="mode-switch">
          <button
            class="mode-button"
            :class="{ 'is-active': displayMode === 'plain' }"
            type="button"
            @click="displayMode = 'plain'"
          >
            普通模式
          </button>
          <button
            class="mode-button"
            :class="{ 'is-active': displayMode === 'card' }"
            type="button"
            @click="displayMode = 'card'"
          >
            卡片模式
          </button>
        </div>
        <button class="refresh-button" type="button" :disabled="loading" @click="fetchLogs">
          {{ loading ? '加载中…' : '刷新日志' }}
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="filters-header">
        <div class="filter-group keyword-group">
          <label class="filter-label">关键字</label>
          <input
            v-model="filters.keyword"
            class="filter-input"
            type="text"
            placeholder="搜索 IP、路径、UA、Referer"
          />
        </div>
        <div class="filter-actions">
          <button
            class="icon-button"
            type="button"
            :class="{ 'is-active': showAdvancedFilters }"
            @click="toggleAdvancedFilters"
          >
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M7 12h10M10 18h4" />
              </svg>
            </span>
            <span>高级筛选</span>
          </button>
          <button
            class="icon-button"
            type="button"
            :class="{ 'is-active': showFormatPanel }"
            :disabled="displayMode !== 'plain'"
            @click="toggleFormatPanel"
            :title="displayMode === 'plain' ? '自定义普通模式日志格式' : '仅普通模式支持格式模板'"
          >
            <span class="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5h9M5 12h14M5 19h9" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 5v2M14 19v-2" />
              </svg>
            </span>
            <span>格式模板</span>
          </button>
        </div>
      </div>
      <div v-if="showAdvancedFilters" class="advanced-grid">
        <div class="filter-group">
          <label class="filter-label">请求方法</label>
          <select v-model="filters.method" class="filter-select">
            <option value="">全部</option>
            <option v-for="method in methodOptions" :key="method" :value="method">{{ method }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">状态码</label>
          <input v-model="filters.status" class="filter-input" type="text" placeholder="例如：200" />
        </div>
        <div class="filter-group">
          <label class="filter-label">响应时间 (ms)</label>
          <div class="filter-input-group">
            <el-input-number v-model="filters.minResponse" class="filter-input" :min="0" :controls="false" placeholder="最小值" />
            <span class="filter-input-divider">-</span>
            <el-input-number v-model="filters.maxResponse" class="filter-input" :min="0" :controls="false" placeholder="最大值" />
          </div>
        </div>
      </div>
      <div v-if="showAdvancedFilters" class="advanced-footer">
        <button class="ghost-button" type="button" @click="handleResetFilters">重置条件</button>
      </div>
    </div>

    <div v-if="displayMode === 'plain' && showFormatPanel" class="format-panel">
      <div class="format-header">
        <div class="format-title">日志格式模板</div>
        <div class="format-hint" v-if="unknownTemplateVariables.length">
          未识别变量：
          <span v-for="item in unknownTemplateVariables" :key="item" class="format-hint-token">${{ item }}</span>
        </div>
      </div>
      <textarea
        v-model="formatTemplate"
        class="format-textarea"
        spellcheck="false"
      ></textarea>
      <div class="format-variables">
        <div class="format-variables-title">可用变量</div>
        <div class="format-variables-grid">
          <div v-for="variable in templateVariables" :key="variable.key" class="format-variable-item">
            <div class="variable-key">${{ variable.key }}</div>
            <div class="variable-desc">{{ variable.label }}</div>
            <div class="variable-example">示例：{{ variable.example }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="log-container">
      <div v-if="loading" class="log-loading">正在加载日志...</div>
      <div v-else-if="errorMessage" class="log-error">{{ errorMessage }}</div>
      <template v-else>
        <ElEmpty
          v-if="!filteredLogs.length"
          description="暂无符合条件的日志"
          class="log-empty"
        />
        <div v-else>
          <div v-if="displayMode === 'card'" class="card-grid">
            <div v-for="(log, index) in filteredLogs" :key="createLogKey(log, index)" class="log-card">
              <div class="log-card-header">
                <div class="log-status" :class="statusClass(log.data.statusCode)">{{ log.data.statusCode }}</div>
                <div class="log-method">{{ log.data.method }}</div>
                <div class="log-path" :title="log.data.url">{{ log.data.path || log.data.url }}</div>
                <div class="log-time">{{ formatTimestamp(log.timestamp) }}</div>
              </div>
              <div class="log-card-meta">
                <div class="meta-item"><span class="meta-label">IP</span>{{ log.data.ip }}</div>
                <div class="meta-item"><span class="meta-label">耗时</span>{{ log.data.responseTime }}ms</div>
                <div class="meta-item"><span class="meta-label">字节</span>{{ log.data.bytesSent }}</div>
                <div class="meta-item"><span class="meta-label">路由</span>{{ log.data.matchedRoute || '未匹配' }}</div>
              </div>
              <button class="toggle-button" type="button" @click="toggleExpanded(log, index)">
                {{ isExpanded(log, index) ? '收起详情' : '展开详情' }}
              </button>
              <div v-if="isExpanded(log, index)" class="log-card-body">
                <div class="detail-grid">
                  <div class="detail-item"><span>协议</span>{{ log.data.protocol || 'HTTP' }}</div>
                  <div class="detail-item"><span>主机名</span>{{ log.data.hostname || '-' }}</div>
                  <div class="detail-item"><span>Referer</span>{{ log.data.referer || '-' }}</div>
                  <div class="detail-item"><span>User-Agent</span>{{ log.data.userAgent || '-' }}</div>
                  <div class="detail-item"><span>Mock 延迟</span>{{ log.data.mockDelay }}ms</div>
                  <div class="detail-item"><span>HTTP 版本</span>{{ log.data.httpVersion }}</div>
                  <div class="detail-item"><span>内容类型</span>{{ log.data.contentType || '-' }}</div>
                  <div class="detail-item"><span>内容长度</span>{{ log.data.contentLength || '-' }}</div>
                  <div class="detail-item"><span>Query</span>{{ log.data.query || '-' }}</div>
                </div>
                <div class="detail-section">
                  <div class="detail-title">Headers</div>
                  <pre class="detail-pre">{{ formatHeaders(log.data.headers) }}</pre>
                </div>
                <div v-if="log.data.body" class="detail-section">
                  <div class="detail-title">Body</div>
                  <pre class="detail-pre">{{ log.data.body }}</pre>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="plain-log-list">
            <div
              v-for="(log, index) in filteredLogs"
              :key="createLogKey(log, index)"
              class="plain-log-line"
              :class="statusClass(log.data.statusCode)"
            >
              {{ renderPlainLog(log) }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useApidocTas } from '@/store/apidoc/tabs'
import { ElEmpty, ElInputNumber } from 'element-plus'
import type { MockLog } from '@src/types/mockNode'

const defaultTemplate = '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_time'

const apidocTabsStore = useApidocTas()
const { currentSelectTab } = storeToRefs(apidocTabsStore)

const loading = ref(false)
const errorMessage = ref('')
const requestLogs = ref<Extract<MockLog, { type: 'request' }>[]>([])
const displayMode = ref<'card' | 'plain'>('plain')
const showAdvancedFilters = ref(false)
const showFormatPanel = ref(false)
const formatTemplate = ref(defaultTemplate)
const lastFetchedAt = ref<number | null>(null)
const expandedMap = reactive<Record<string, boolean>>({})

const filters = reactive({
  keyword: '',
  method: '',
  status: '',
  minResponse: '',
  maxResponse: '',
})

const templateVariables = [
  { key: 'remote_addr', label: '客户端 IP', example: '127.0.0.1' },
  { key: 'remote_user', label: '客户端用户，默认 -', example: '-' },
  { key: 'time_local', label: '本地时间，格式：YYYY-MM-DD HH:mm:ss', example: '2024-09-01 12:30:45' },
  { key: 'request', label: '请求行：METHOD URL HTTP/version', example: 'GET /api/profile HTTP/1.1' },
  { key: 'status', label: 'HTTP 状态码', example: '200' },
  { key: 'body_bytes_sent', label: '响应字节数', example: '512' },
  { key: 'http_referer', label: 'Referer', example: 'https://example.com/list' },
  { key: 'http_user_agent', label: 'User-Agent', example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4)' },
  { key: 'request_time', label: '响应耗时（秒）', example: '0.120' },
  { key: 'matched_route', label: '匹配的 Mock 路由', example: '/api/profile' },
  { key: 'mock_delay', label: 'Mock 延迟（毫秒）', example: '150' },
  { key: 'protocol', label: '协议名', example: 'HTTP/1.1' },
  { key: 'hostname', label: '主机名', example: 'mock.local' },
  { key: 'content_type', label: '内容类型', example: 'application/json' },
  { key: 'content_length', label: '内容长度', example: '512' },
  { key: 'query_string', label: '查询字符串', example: 'id=1&lang=zh-CN' },
  { key: 'response_time_ms', label: '响应耗时（毫秒）', example: '120' },
]

const templateVariableKeys = computed(() => templateVariables.map(item => item.key))

const methodOptions = computed(() => {
  const set = new Set<string>()
  requestLogs.value.forEach(log => {
    set.add(log.data.method.toUpperCase())
  })
  return Array.from(set).sort()
})

const filteredLogs = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()
  const statusFilter = filters.status.trim()
  const minResponse = filters.minResponse ? Number(filters.minResponse) : null
  const maxResponse = filters.maxResponse ? Number(filters.maxResponse) : null

  return requestLogs.value
    .slice()
    .filter(log => {
      if (filters.method && log.data.method.toUpperCase() !== filters.method) {
        return false
      }
      if (statusFilter && String(log.data.statusCode) !== statusFilter) {
        return false
      }
      if (minResponse !== null && !Number.isNaN(minResponse) && log.data.responseTime < minResponse) {
        return false
      }
      if (maxResponse !== null && !Number.isNaN(maxResponse) && log.data.responseTime > maxResponse) {
        return false
      }
      if (!keyword) {
        return true
      }
      const haystack = [
        log.data.ip,
        log.data.url,
        log.data.path,
        log.data.query,
        log.data.userAgent,
        log.data.referer,
        log.data.matchedRoute,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
    .sort((a, b) => b.timestamp - a.timestamp)
})

const templateVariableResolvers: Record<string, (log: Extract<MockLog, { type: 'request' }>) => string> = {
  remote_addr: log => log.data.ip,
  remote_user: () => '-',
  time_local: log => formatTimestamp(log.timestamp),
  request: log => `${log.data.method} ${log.data.url} HTTP/${log.data.httpVersion}`,
  status: log => String(log.data.statusCode),
  body_bytes_sent: log => String(log.data.bytesSent ?? 0),
  http_referer: log => log.data.referer || '-',
  http_user_agent: log => log.data.userAgent || '-',
  request_time: log => formatDurationSeconds(log.data.responseTime),
  matched_route: log => log.data.matchedRoute || '-',
  mock_delay: log => `${log.data.mockDelay ?? 0}`,
  protocol: log => log.data.protocol || (log.data.httpVersion?.startsWith('2') ? 'HTTP/2' : 'HTTP/1.1'),
  hostname: log => log.data.hostname || '-',
  content_type: log => log.data.contentType || '-',
  content_length: log => String(log.data.contentLength ?? log.data.bytesSent ?? 0),
  query_string: log => log.data.query || '-',
  response_time_ms: log => String(log.data.responseTime ?? 0),
}

const unknownTemplateVariables = computed(() => {
  const matches = formatTemplate.value.match(/\$[a-zA-Z_]+/g) || []
  const keys = matches.map(item => item.slice(1))
  return Array.from(new Set(keys.filter(key => !templateVariableKeys.value.includes(key))))
})

const currentNodeId = computed(() => currentSelectTab.value?._id || '')

const fetchLogs = async () => {
  if (!currentNodeId.value || !window.electronAPI?.mock) {
    requestLogs.value = []
    errorMessage.value = ''
    lastFetchedAt.value = null
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await window.electronAPI.mock.getLogsByNodeId(currentNodeId.value)
    requestLogs.value = response.filter((log): log is Extract<MockLog, { type: 'request' }> => log.type === 'request')
    lastFetchedAt.value = Date.now()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '日志加载失败'
  } finally {
    loading.value = false
  }
}

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const toggleFormatPanel = () => {
  if (displayMode.value !== 'plain') {
    return
  }
  showFormatPanel.value = !showFormatPanel.value
}

const handleResetFilters = () => {
  filters.keyword = ''
  filters.method = ''
  filters.status = ''
  filters.minResponse = ''
  filters.maxResponse = ''
}

const formatDurationSeconds = (milliseconds: number) => {
  if (!milliseconds && milliseconds !== 0) {
    return '0'
  }
  return (milliseconds / 1000).toFixed(3)
}

const formatHeaders = (headers: Record<string, string>) => {
  const entries = Object.entries(headers || {})
  if (!entries.length) {
    return '无 Headers'
  }
  return entries.map(([key, value]) => `${key}: ${value}`).join('\n')
}

const formatTimestamp = (value: number | null) => {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  const yyyy = date.getFullYear()
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  const hh = `${date.getHours()}`.padStart(2, '0')
  const mi = `${date.getMinutes()}`.padStart(2, '0')
  const ss = `${date.getSeconds()}`.padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

const renderPlainLog = (log: Extract<MockLog, { type: 'request' }>) => {
  return formatTemplate.value.replace(/\$[a-zA-Z_]+/g, match => {
    const key = match.slice(1)
    const resolver = templateVariableResolvers[key]
    if (!resolver) {
      return match
    }
    return resolver(log)
  })
}

const createLogKey = (log: Extract<MockLog, { type: 'request' }>, index: number) => {
  return `${log.timestamp}-${log.data.method}-${log.data.url}-${index}`
}

const statusClass = (status: number) => {
  if (status >= 500) {
    return 'status-error'
  }
  if (status >= 400) {
    return 'status-warn'
  }
  if (status >= 300) {
    return 'status-notice'
  }
  return 'status-success'
}

const toggleExpanded = (log: Extract<MockLog, { type: 'request' }>, index: number) => {
  const key = createLogKey(log, index)
  expandedMap[key] = !expandedMap[key]
}

const isExpanded = (log: Extract<MockLog, { type: 'request' }>, index: number) => {
  const key = createLogKey(log, index)
  return Boolean(expandedMap[key])
}

watch(displayMode, value => {
  if (value === 'card') {
    showFormatPanel.value = false
  }
})

watch(currentNodeId, (value, oldValue) => {
  if (value && value !== oldValue) {
    fetchLogs()
  }
}, { immediate: true })
</script>

<style scoped>
.log-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 16px;
  background-color: #f7f8fa;
  color: #1f2933;
  overflow: auto;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toolbar-title {
  font-size: 18px;
  font-weight: 600;
}

.toolbar-meta {
  font-size: 12px;
  color: #64748b;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-switch {
  display: inline-flex;
  background: #e2e8f0;
  border-radius: 999px;
  padding: 4px;
}

.mode-button {
  border: none;
  background: transparent;
  color: #475569;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-button.is-active {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
}

.mode-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-button {
  border: 1px solid #1d4ed8;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.refresh-button:disabled {
  background: #94a3b8;
  border-color: #94a3b8;
  cursor: not-allowed;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.08);
}

.filters-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.keyword-group {
  flex: 1;
  min-width: 220px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5f5;
  background: #f8fafc;
  font-size: 13px;
  color: #1f2937;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-button .icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
}

.icon-button svg {
  width: 100%;
  height: 100%;
}

.icon-button.is-active {
  border-color: #6366f1;
  color: #42389d;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-button:not(:disabled):hover {
  border-color: #94a3b8;
  color: #1e293b;
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.filter-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-input-divider {
  color: #94a3b8;
  font-size: 12px;
}

.advanced-footer {
  display: flex;
  justify-content: flex-end;
}

.ghost-button {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-button:hover {
  border-color: #94a3b8;
  color: #1e293b;
}

.format-panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.format-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.format-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.format-hint {
  font-size: 12px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.format-hint-token {
  padding: 2px 6px;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 6px;
  font-weight: 500;
}

.format-textarea {
  width: 100%;
  min-height: 80px;
  border-radius: 12px;
  border: 1px solid #cbd5f5;
  padding: 12px;
  font-size: 13px;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  background: #f8fafc;
  color: #0f172a;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.format-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.format-variables {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.format-variables-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.format-variables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.format-variable-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.variable-key {
  font-weight: 600;
  font-size: 12px;
  color: #0f172a;
}

.variable-desc {
  font-size: 12px;
  color: #64748b;
}

.variable-example {
  font-size: 12px;
  color: #1f2933;
}

.log-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  min-height: 240px;
}

.log-loading,
.log-error {
  text-align: center;
  font-size: 14px;
  color: #475569;
  padding: 48px 0;
}

.log-error {
  color: #dc2626;
}

.log-empty :deep(.el-empty__description) {
  color: #64748b;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.log-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.log-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
}

.log-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.status-success {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.status-notice {
  background: rgba(59, 130, 246, 0.12);
  color: #1e3a8a;
}

.status-warn {
  background: rgba(234, 179, 8, 0.18);
  color: #92400e;
}

.status-error {
  background: rgba(248, 113, 113, 0.15);
  color: #b91c1c;
}

.log-method {
  font-weight: 600;
  font-size: 13px;
  color: #0f172a;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid #cbd5f5;
  background: #eef2ff;
}

.log-path {
  flex: 1;
  font-size: 13px;
  color: #1f2933;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-time {
  font-size: 12px;
  color: #64748b;
}

.log-card-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 12px;
}

.meta-item {
  font-size: 12px;
  color: #475569;
  display: flex;
  gap: 6px;
}

.meta-label {
  font-weight: 600;
  color: #0f172a;
}

.toggle-button {
  align-self: flex-end;
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.toggle-button:hover {
  color: #1d4ed8;
}

.log-card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.detail-item {
  font-size: 12px;
  color: #475569;
  display: flex;
  gap: 4px;
}

.detail-item span {
  font-weight: 600;
  color: #0f172a;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-title {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.detail-pre {
  max-height: 180px;
  overflow: auto;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
}

.plain-log-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 12px;
  color: #0f172a;
}

.plain-log-line {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  white-space: pre-wrap;
  word-break: break-all;
  transition: background 0.2s ease;
}

.plain-log-line:hover {
  background: #f1f5f9;
}
</style>
