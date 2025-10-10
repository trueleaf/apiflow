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
  gap: 12px;
  height: calc(100vh - var(--apiflow-header-height) - var(--apiflow-doc-nav-height) - 50px);
  padding: 20px;
  background: var(--white);
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
}

.toolbar-meta {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-switch {
  display: inline-flex;
  background: var(--gray-200);
  border-radius: var(--border-radius-base);
  padding: 2px;
}

.mode-button {
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-size: var(--font-size-sm);
  padding: 6px 12px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-button.is-active {
  background: var(--white);
  color: var(--gray-800);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.mode-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-button {
  border: none;
  background: var(--primary);
  color: var(--white);
  font-size: var(--font-size-sm);
  padding: 8px 16px;
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: background 0.2s ease;
}

.refresh-button:hover {
  background: var(--el-color-primary-light-3);
}

.refresh-button:disabled {
  background: var(--gray-400);
  cursor: not-allowed;
}

/* 筛选器 */
.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--gray-100);
  padding: 16px;
  border-radius: var(--border-radius-base);
  flex-shrink: 0;
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
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-700);
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--gray-300);
  background: var(--white);
  font-size: var(--font-size-sm);
  color: var(--gray-800);
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
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
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-600);
  font-size: var(--font-size-sm);
  padding: 8px 12px;
  border-radius: var(--border-radius-base);
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
  border-color: var(--primary);
  color: var(--primary);
  background: var(--el-color-primary-light-9);
}

.icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-button:not(:disabled):hover {
  border-color: var(--gray-400);
  color: var(--gray-800);
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
  color: var(--gray-500);
  font-size: var(--font-size-xs);
}

.advanced-footer {
  display: flex;
  justify-content: flex-end;
}

.ghost-button {
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-600);
  font-size: var(--font-size-sm);
  padding: 8px 16px;
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-button:hover {
  border-color: var(--gray-400);
  color: var(--gray-800);
}

/* 格式模板面板 */
.format-panel {
  background: var(--gray-100);
  border-radius: var(--border-radius-base);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.format-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.format-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--gray-800);
}

.format-hint {
  font-size: var(--font-size-xs);
  color: var(--danger);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.format-hint-token {
  padding: 2px 6px;
  background: var(--el-color-danger-light-9);
  border-radius: var(--border-radius-sm);
  font-weight: 500;
}

.format-textarea {
  width: 100%;
  min-height: 80px;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--gray-300);
  padding: 12px;
  font-size: var(--font-size-sm);
  font-family: 'Consolas', 'Monaco', monospace;
  background: var(--white);
  color: var(--gray-800);
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.format-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
}

.format-variables {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.format-variables-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--gray-700);
}

.format-variables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.format-variable-item {
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-base);
  background: var(--white);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.variable-key {
  font-weight: 600;
  font-size: var(--font-size-xs);
  color: var(--gray-800);
}

.variable-desc {
  font-size: var(--font-size-xs);
  color: var(--gray-600);
}

.variable-example {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

/* 日志容器 */
.log-container {
  background: var(--white);
  border-radius: var(--border-radius-base);
  border: 1px solid var(--gray-300);
  padding: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 自定义滚动条样式 */
.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: var(--border-radius-sm);
}

.log-container::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: var(--border-radius-sm);
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}

.log-loading,
.log-error {
  text-align: center;
  font-size: var(--font-size-base);
  color: var(--gray-600);
  padding: 48px 0;
}

.log-error {
  color: var(--danger);
}

.log-empty :deep(.el-empty__description) {
  color: var(--gray-500);
}

/* 卡片模式 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
}

.log-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-base);
  padding: 16px;
  background: var(--white);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.log-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.log-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-status {
  padding: 4px 8px;
  border-radius: var(--border-radius-base);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.status-success {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success-dark-2);
}

.status-notice {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info-dark-2);
}

.status-warn {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
}

.status-error {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger-dark-2);
}

.log-method {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--gray-800);
  padding: 2px 8px;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--gray-300);
  background: var(--gray-100);
}

.log-path {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-time {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.log-card-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  background: var(--gray-100);
  border-radius: var(--border-radius-base);
  padding: 12px;
}

.meta-item {
  font-size: var(--font-size-xs);
  color: var(--gray-600);
  display: flex;
  gap: 6px;
}

.meta-label {
  font-weight: 600;
  color: var(--gray-800);
}

.toggle-button {
  align-self: flex-end;
  border: none;
  background: transparent;
  color: var(--primary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: color 0.2s ease;
}

.toggle-button:hover {
  color: var(--el-color-primary-light-3);
}

.log-card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--gray-300);
  padding-top: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.detail-item {
  font-size: var(--font-size-xs);
  color: var(--gray-600);
  display: flex;
  gap: 4px;
}

.detail-item span {
  font-weight: 600;
  color: var(--gray-800);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--gray-800);
}

.detail-pre {
  max-height: 180px;
  overflow: auto;
  background: var(--gray-900);
  color: var(--gray-200);
  border-radius: var(--border-radius-base);
  padding: 12px;
  font-size: var(--font-size-xs);
  line-height: 1.6;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 普通模式 */
.plain-log-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: var(--font-size-xs);
  color: var(--gray-800);
}

.plain-log-line {
  padding: 8px 12px;
  border-radius: var(--border-radius-base);
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  white-space: pre-wrap;
  word-break: break-all;
  transition: background 0.2s ease;
}

.plain-log-line:hover {
  background: var(--gray-200);
}
</style>
