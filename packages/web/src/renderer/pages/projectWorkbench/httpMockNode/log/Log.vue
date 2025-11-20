<template>
  <div class="log-page">
    <div class="filters">
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">关键字</label>
          <el-input
            v-model="filters.keyword"
            placeholder="搜索 IP、路径、UA、Referer"
            clearable
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">请求方法</label>
          <el-select v-model="filters.method" placeholder="全部" clearable>
            <el-option
              v-for="method in methodOptions"
              :key="method"
              :label="method"
              :value="method"
            />
          </el-select>
        </div>
        <div class="filter-group">
          <label class="filter-label">状态码</label>
          <el-input v-model="filters.status" placeholder="例如：200" clearable />
        </div>
        <div class="filter-actions">
          <el-button @click="handleResetFilters">重置条件</el-button>
          <el-button type="primary" :loading="loading" @click="fetchLogs">
            刷新日志
          </el-button>
        </div>
      </div>
    </div>

    <div class="log-container">
      <div class="operation">
        <div class="view-toggle-group">
          <div 
            class="view-toggle-btn" 
            :class="{ active: viewMode === 'compact' }"
            :title="'简洁视图'"
            @click="viewMode = 'compact'"
          >
            <List :size="16" />
          </div>
          <div 
            class="view-toggle-btn" 
            :class="{ active: viewMode === 'detailed' }"
            :title="'详细视图'"
            @click="viewMode = 'detailed'"
          >
            <LayoutList :size="16" />
          </div>
        </div>
        <div class="operation-btn" @click="handleClearLogs">
          <Trash2 :size="16" />
          <span>清除</span>
        </div>
        <div class="operation-btn" @click="openFormatDialog">
          <FileText :size="16" />
          <span>模板</span>
        </div>
      </div>
      <div v-if="loading" class="log-loading">正在加载日志...</div>
      <div v-else-if="errorMessage" class="log-error">{{ errorMessage }}</div>
      <template v-else>
        <ElEmpty
          v-if="!filteredLogs.length"
          description="暂无符合条件的日志"
          class="log-empty"
        />
        <div v-else-if="viewMode === 'compact'" class="plain-log-list">
          <div
            v-for="(log, index) in filteredLogs"
            :key="createLogKey(log, index)"
            class="plain-log-line"
            :class="statusClass(log.data.statusCode)"
          >
            <div class="log-content">
              <template v-for="(segment, idx) in getLogSegments(log)" :key="idx">
                <span v-if="segment.highlight" class="highlight-keyword">{{ segment.text }}</span>
                <span v-else>{{ segment.text }}</span>
              </template>
              
              <!-- Console日志徽章 -->
              <template v-if="getConsoleLogStats(log).total > 0">
                <span 
                  class="console-badge" 
                  :class="{
                    'has-error': getConsoleLogStats(log).errorCount > 0,
                    'has-warn': getConsoleLogStats(log).warnCount > 0 && getConsoleLogStats(log).errorCount === 0,
                  }"
                  :title="`点击查看 Console 日志: ${getConsoleLogStats(log).total} 条`"
                  @click.stop="showConsoleLogs(log)"
                >
                  {{ getConsoleLogStats(log).total }}
                </span>
              </template>
            </div>
            <div class="log-actions">
              <el-button size="small" @click="showLogDetail(log)">
                完整数据
              </el-button>
            </div>
          </div>
        </div>
        <div v-else class="detailed-log-list">
          <div
            v-for="(log, index) in filteredLogs"
            :key="createLogKey(log, index)"
            class="detailed-log-item"
          >
            <div class="detailed-log-header">
              <div class="header-row">
                <span class="log-time">{{ formatTimestamp(log.timestamp) }}</span>
                <span class="log-method" :class="`method-${log.data.method.toLowerCase()}`">
                  {{ log.data.method }}
                </span>
                <span class="log-url">{{ log.data.url }}</span>
                <span class="log-status" :class="statusClass(log.data.statusCode)">
                  {{ log.data.statusCode }}
                </span>
              </div>
              <div class="header-meta">
                <span class="meta-item">IP: {{ log.data.ip }}</span>
                <span class="meta-item">响应时间: {{ log.data.responseTime ?? 0 }}ms</span>
                <template v-if="getConsoleLogStats(log).total > 0">
                  <span 
                    class="console-badge-inline" 
                    :class="{
                      'has-error': getConsoleLogStats(log).errorCount > 0,
                      'has-warn': getConsoleLogStats(log).warnCount > 0 && getConsoleLogStats(log).errorCount === 0,
                    }"
                    @click.stop="showConsoleLogs(log)"
                  >
                    Console: {{ getConsoleLogStats(log).total }}
                  </span>
                </template>
                <el-button size="small" @click="showLogDetail(log)">完整数据</el-button>
              </div>
            </div>
            
            <el-collapse class="detailed-collapse">
              <el-collapse-item title="请求头" :name="`headers-${index}`">
                <div class="headers-grid">
                  <template v-for="(value, key) in log.data.headers" :key="key">
                    <div class="header-key">{{ key }}</div>
                    <div class="header-value">{{ value }}</div>
                  </template>
                </div>
              </el-collapse-item>
              
              <el-collapse-item :name="`body-${index}`">
                <template #title>
                  <span>请求体</span>
                  <span v-if="log.data.contentType" class="content-type-hint">
                    ({{ log.data.contentType.split(';')[0] }})
                  </span>
                </template>
                <div class="body-content">
                  <template v-if="formatRequestBody(log).type === 'empty'">
                    <div class="empty-hint">{{ formatRequestBody(log).value }}</div>
                  </template>
                  <template v-else-if="formatRequestBody(log).type === 'json'">
                    <div v-if="formatRequestBody(log).error" class="error-hint">
                      {{ formatRequestBody(log).error }}
                    </div>
                    <pre class="json-body">{{ formatRequestBody(log).value }}</pre>
                  </template>
                  <template v-else-if="formatRequestBody(log).type === 'urlencoded'">
                    <div class="urlencoded-list">
                      <div 
                        v-for="(field, idx) in (formatRequestBody(log).fields as Array<{ key: string; value: string }>)" 
                        :key="idx"
                        class="urlencoded-item"
                      >
                        <span class="field-key">{{ field.key }}</span>
                        <span class="field-separator">=</span>
                        <span class="field-value">{{ field.value }}</span>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="formatRequestBody(log).type === 'formdata'">
                    <div class="formdata-table">
                      <div class="table-header">
                        <div class="table-cell">字段名</div>
                        <div class="table-cell">值</div>
                      </div>
                      <div 
                        v-for="(field, idx) in (formatRequestBody(log).fields as Array<{ name: string; value: string; filename?: string }>)" 
                        :key="idx"
                        class="table-row"
                      >
                        <div class="table-cell">{{ field.name }}</div>
                        <div class="table-cell">{{ field.value }}</div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div v-if="formatRequestBody(log).error" class="error-hint">
                      {{ formatRequestBody(log).error }}
                    </div>
                    <pre class="raw-body">{{ formatRequestBody(log).value }}</pre>
                  </template>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </template>
    </div>
  </div>

  <el-dialog
    v-model="detailDialogVisible"
    title="完整日志数据"
    width="800px"
    destroy-on-close
  >
    <SJsonEditor
      v-model="currentLogJson"
      :read-only="true"
      :auto-height="true"
      :max-height="600"
    />
  </el-dialog>

  <el-dialog
    v-model="formatDialogVisible"
    title="日志格式模板"
    width="900px"
    destroy-on-close
  >
    <div class="format-dialog-content">
      <div class="format-hint" v-if="unknownTemplateVariables.length">
        未识别变量：
        <span v-for="item in unknownTemplateVariables" :key="item" class="format-hint-token">${{ item }}</span>
      </div>
      <textarea
        v-model="tempFormatTemplate"
        class="format-textarea"
        spellcheck="false"
      ></textarea>
      <div class="format-actions">
        <el-button @click="resetFormatTemplate">重置为默认</el-button>
        <el-button type="primary" @click="saveFormatTemplate">保存</el-button>
      </div>
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
  </el-dialog>

  <el-dialog
    v-model="consoleDialogVisible"
    title="Console 日志详情"
    width="800px"
    destroy-on-close
  >
    <div class="console-dialog-content">
      <div class="console-logs-list">
        <div
          v-for="(log, index) in currentConsoleLogs"
          :key="index"
          class="console-log-item"
          :class="`level-${log.level}`"
        >
          <div class="console-log-header">
            <component :is="getConsoleLevelIcon(log.level)" :size="16" class="console-log-icon" />
            <span class="console-log-level">{{ log.level.toUpperCase() }}</span>
            <span v-if="log.timestamp" class="console-log-time">{{ formatTimestamp(log.timestamp) }}</span>
          </div>
          <div class="console-log-content">
            <pre v-if="typeof log.message === 'object'">{{ formatConsoleLogValue(log.message) }}</pre>
            <span v-else>{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useApidocTas } from '@/store/apidoc/tabsStore'
import { ElEmpty, ElButton, ElInput, ElSelect, ElOption, ElDialog, ElMessageBox, ElCollapse, ElCollapseItem } from 'element-plus'
import type { MockLog } from '@src/types/mockNode'
import { httpMockLogsCache } from '@/cache/mock/httpMock/httpMockLogsCache'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import { Trash2, FileText, AlertCircle, AlertTriangle, Info, List, LayoutList } from 'lucide-vue-next'
import { IPC_EVENTS } from '@src/types/ipc'
import { appState } from '@/cache/appState/appStateCache'


const defaultTemplate = '[$time_local] $remote_addr - $remote_user "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $response_time_ms ms'

const apidocTabsStore = useApidocTas()
const { currentSelectTab } = storeToRefs(apidocTabsStore)
const loading = ref(false)
const errorMessage = ref('')
const requestLogs = ref<Extract<MockLog, { type: 'request' }>[]>([])
const formatTemplate = ref(defaultTemplate)
const isRealtimeMode = ref(true)
const MAX_LOGS_IN_MEMORY = 1000
const detailDialogVisible = ref(false)
const currentLogJson = ref('')
const formatDialogVisible = ref(false)
const tempFormatTemplate = ref('')
const consoleDialogVisible = ref(false)
const currentConsoleLogs = ref<Array<{ level: string; message: unknown; timestamp?: number }>>([])
const viewMode = ref<'compact' | 'detailed'>('compact')

const filters = reactive({
  keyword: '',
  method: '',
  status: '',
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

  return requestLogs.value
    .slice()
    .filter(log => {
      if (filters.method && log.data.method.toUpperCase() !== filters.method) {
        return false
      }
      if (statusFilter && String(log.data.statusCode) !== statusFilter) {
        return false
      }
      if (!keyword) {
        return true
      }
      const renderedText = renderLogText(log).toLowerCase()
      return renderedText.includes(keyword)
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
  request_time: log => ((log.data.responseTime ?? 0) / 1000).toFixed(3),
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
  const matches = tempFormatTemplate.value.match(/\$[a-zA-Z_]+/g) || []
  const keys = matches.map(item => item.slice(1))
  return Array.from(new Set(keys.filter(key => !templateVariableKeys.value.includes(key))))
})

const currentNodeId = computed(() => currentSelectTab.value?._id || '')
// 初始化视图模式
watch(currentNodeId, (newId) => {
  if (newId) {
    viewMode.value = appState.getHttpMockLogViewMode(newId)
  }
}, { immediate: true })
// 监听视图模式变化，持久化到缓存
watch(viewMode, (newMode) => {
  if (currentNodeId.value) {
    appState.setHttpMockLogViewMode(currentNodeId.value, newMode)
  }
})
// 从缓存加载日志
const fetchLogs = async () => {
  if (!currentNodeId.value) {
    requestLogs.value = []
    errorMessage.value = ''
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const allLogs = await httpMockLogsCache.getLogsByNodeId(currentNodeId.value)
    requestLogs.value = allLogs.filter((log): log is Extract<MockLog, { type: 'request' }> => log.type === 'request')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '日志加载失败'
  } finally {
    loading.value = false
  }
}
// 处理批量日志推送
const handleLogsBatch = (logs: MockLog[]) => {
  if (!isRealtimeMode.value || !currentNodeId.value) {
    return
  }
  if (!logs || !Array.isArray(logs)) {
    console.error('接收到的日志数据格式错误:', logs);
    return
  }
  const relevantLogs = logs.filter(
    (log): log is Extract<MockLog, { type: 'request' }> => 
      log.type === 'request' && log.nodeId === currentNodeId.value
  )
  if (relevantLogs.length === 0) {
    return
  }
  requestLogs.value.push(...relevantLogs)
  if (requestLogs.value.length > MAX_LOGS_IN_MEMORY) {
    requestLogs.value = requestLogs.value.slice(-MAX_LOGS_IN_MEMORY)
  }
}
// 清除日志
const handleClearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清除所有日志吗？此操作不可恢复。', '确认清除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    if (currentNodeId.value) {
      await httpMockLogsCache.clearLogsByNodeId(currentNodeId.value)
    }
    requestLogs.value = []
  } catch (error) {
    // 用户取消操作
  }
}
// 打开格式模板弹窗
const openFormatDialog = () => {
  tempFormatTemplate.value = formatTemplate.value
  formatDialogVisible.value = true
}
// 保存格式模板
const saveFormatTemplate = () => {
  formatTemplate.value = tempFormatTemplate.value
  formatDialogVisible.value = false
}
// 重置格式模板
const resetFormatTemplate = () => {
  tempFormatTemplate.value = defaultTemplate
}
const handleResetFilters = () => {
  filters.keyword = ''
  filters.method = ''
  filters.status = ''
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
// 解析 multipart/form-data 请求体
const parseMultipartFormData = (body: string, contentType: string): Array<{ name: string; value: string; filename?: string }> => {
  try {
    const boundaryMatch = contentType.match(/boundary=([^;]+)/)
    if (!boundaryMatch) {
      return []
    }
    const boundary = boundaryMatch[1].trim()
    const parts = body.split(`--${boundary}`)
    const fields: Array<{ name: string; value: string; filename?: string }> = []
    for (const part of parts) {
      if (!part.trim() || part.trim() === '--') {
        continue
      }
      const headerEndIndex = part.indexOf('\r\n\r\n')
      if (headerEndIndex === -1) {
        continue
      }
      const headers = part.substring(0, headerEndIndex)
      const content = part.substring(headerEndIndex + 4).trim()
      const dispositionMatch = headers.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i)
      if (dispositionMatch) {
        const name = dispositionMatch[1]
        const filename = dispositionMatch[2]
        const displayValue = content.length > 100 ? `${content.substring(0, 100)}...` : content
        fields.push({
          name,
          value: filename ? `[文件: ${filename}]` : displayValue,
          filename
        })
      }
    }
    return fields
  } catch (error) {
    return []
  }
}
// 智能格式化请求体
const formatRequestBody = (log: Extract<MockLog, { type: 'request' }>) => {
  const { body, contentType } = log.data
  if (!body) {
    return { type: 'empty', value: '无请求体' }
  }
  try {
    if (contentType.includes('application/json')) {
      try {
        const parsed = JSON.parse(body)
        return { type: 'json', value: JSON.stringify(parsed, null, 2) }
      } catch {
        return { type: 'raw', value: body, error: 'JSON 格式错误，显示原始数据' }
      }
    }
    if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        const params = new URLSearchParams(body)
        const fields: Array<{ key: string; value: string }> = []
        params.forEach((value, key) => {
          fields.push({ key, value })
        })
        return { type: 'urlencoded', fields }
      } catch {
        return { type: 'raw', value: body, error: '解析失败，显示原始数据' }
      }
    }
    if (contentType.includes('multipart/form-data')) {
      const fields = parseMultipartFormData(body, contentType)
      if (fields.length > 0) {
        return { type: 'formdata', fields }
      }
      const truncated = body.length > 1000 ? `${body.substring(0, 1000)}\n\n...(已截断，共${body.length}字符)` : body
      return { type: 'raw', value: truncated, error: '无法解析 FormData，显示原始数据(已截断)' }
    }
    const truncated = body.length > 1000 ? `${body.substring(0, 1000)}\n\n...(已截断，共${body.length}字符)` : body
    return { type: 'raw', value: truncated }
  } catch (error) {
    return { type: 'raw', value: body, error: '解析失败' }
  }
}
// 渲染日志文本
const renderLogText = (log: Extract<MockLog, { type: 'request' }>) => {
  return formatTemplate.value.replace(/\$[a-zA-Z_]+/g, match => {
    const key = match.slice(1)
    const resolver = templateVariableResolvers[key]
    if (!resolver) {
      return match
    }
    return resolver(log)
  })
}
// 将日志文本分割成片段，用于高亮显示
const getLogSegments = (log: Extract<MockLog, { type: 'request' }>) => {
  const text = renderLogText(log)
  const keyword = filters.keyword.trim()
  if (!keyword) {
    return [{ text, highlight: false }]
  }
  const segments: Array<{ text: string; highlight: boolean }> = []
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const reg = new RegExp(escapedKeyword, 'gi')
  let lastIndex = 0
  let match
  while ((match = reg.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.substring(lastIndex, match.index), highlight: false })
    }
    segments.push({ text: match[0], highlight: true })
    lastIndex = reg.lastIndex
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.substring(lastIndex), highlight: false })
  }
  return segments.length > 0 ? segments : [{ text, highlight: false }]
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
// 获取Console日志统计
const getConsoleLogStats = (log: Extract<MockLog, { type: 'request' }>) => {
  const logs = log.data.consoleLogs || []
  return {
    total: logs.length,
    errorCount: logs.filter(l => l.level === 'error').length,
    warnCount: logs.filter(l => l.level === 'warn').length,
  }
}
// 显示日志详情
const showLogDetail = (log: Extract<MockLog, { type: 'request' }>) => {
  currentLogJson.value = JSON.stringify(log, null, 2)
  detailDialogVisible.value = true
}
// 显示Console日志详情
const showConsoleLogs = (log: Extract<MockLog, { type: 'request' }>) => {
  currentConsoleLogs.value = log.data.consoleLogs || []
  consoleDialogVisible.value = true
}
// 获取Console日志级别图标
const getConsoleLevelIcon = (level: string) => {
  switch (level) {
    case 'error':
      return AlertCircle
    case 'warn':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return Info
  }
}
// 格式化Console日志内容
const formatConsoleLogValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}
watch(currentNodeId, (value, oldValue) => {
  if (value && value !== oldValue) {
    fetchLogs()
  }
}, { immediate: true })
// 组件挂载时注册IPC监听器
onMounted(() => {
  window.electronAPI?.ipcManager.onMain(IPC_EVENTS.mock.mainToRenderer.logsBatch, handleLogsBatch)
})
// 组件卸载时移除监听器
onUnmounted(() => {
  window.electronAPI?.ipcManager.removeListener(IPC_EVENTS.mock.mainToRenderer.logsBatch, handleLogsBatch)
})
</script>

<style scoped>
.log-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - var(--apiflow-header-height) - var(--apiflow-doc-nav-height) - 50px);
  padding: 0 20px 20px 20px;
  background: var(--bg-primary);
  overflow: hidden;
}
/* 筛选器 */
.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 16px 16px;
  border-radius: var(--border-radius-base);
  flex-shrink: 0;
}
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  align-items: end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
}
.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
/* 日志容器 */
.log-container {
  background: var(--bg-primary);
  border-radius: var(--border-radius-base);
  padding: 0 16px 16px 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid var(--border-base);
}

/* 自定义滚动条样式 */
.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
}

.log-container::-webkit-scrollbar-thumb {
  background: var(--border-base);
  border-radius: var(--border-radius-sm);
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: var(--border-light);
}

.log-loading,
.log-error {
  text-align: center;
  font-size: var(--font-size-base);
  color: var(--text-tertiary);
  padding: 48px 0;
}

.log-error {
  color: var(--danger-color);
}

.log-empty :deep(.el-empty__description) {
  color: var(--text-tertiary);
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
/* 普通模式 */
.plain-log-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: var(--font-size-xs);
  color: var(--text-primary);
}

.plain-log-line {
  padding: 8px 12px;
  border-radius: var(--border-radius-base);
  background: var(--bg-secondary);
  border: 1px solid var(--border-base);
  white-space: pre-wrap;
  word-break: break-all;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.plain-log-line:hover {
  background: var(--bg-hover);
}

.log-content {
  flex: 1;
  min-width: 0;
}
.highlight-keyword {
  background: var(--bg-secondary);
  color: var(--warning-color);
  font-weight: bold;
  border-radius: var(--border-radius-xs);
  padding: 0 2px;
}
.log-actions {
  flex-shrink: 0;
}
/* Console日志徽章 */
.console-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  margin-left: 8px;
  border-radius: 10px;
  background: var(--el-color-info-light-8);
  color: var(--el-color-info);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}
.console-badge:hover {
  background: var(--el-color-info-light-7);
}
.console-badge.has-warn {
  background: var(--el-color-warning-light-8);
  color: var(--el-color-warning-dark-2);
}
.console-badge.has-warn:hover {
  background: var(--el-color-warning-light-7);
}
.console-badge.has-error {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger-dark-2);
}
.console-badge.has-error:hover {
  background: var(--el-color-danger-light-7);
}
/* 操作区域 */
.operation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  /* margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light); */
}
.view-toggle-group {
  display: flex;
  gap: 4px;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-sm);
  padding: 2px;
  background: var(--bg-secondary);
  margin-right: auto;
}
.view-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: var(--border-radius-xs);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}
.view-toggle-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.view-toggle-btn.active {
  background: var(--primary-color);
  color: white;
}
.operation-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: none;
}
.operation-btn:hover {
  color: var(--primary-color);
}
/* 格式模板弹窗内容 */
.format-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.format-hint {
  font-size: var(--font-size-xs);
  color: var(--danger-color);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.format-hint-token {
  padding: 2px 6px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  font-weight: 500;
}
.format-textarea {
  width: 100%;
  min-height: 120px;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-base);
  padding: 12px;
  font-size: var(--font-size-sm);
  font-family: 'Consolas', 'Monaco', monospace;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border 0.2s ease, box-shadow 0.2s ease;
  resize: vertical;
}
.format-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--bg-secondary);
}
.format-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.format-variables {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.format-variables-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}
.format-variables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}
.format-variable-item {
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  background: var(--bg-primary);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.variable-key {
  font-weight: 600;
  font-size: var(--font-size-xs);
  color: var(--text-primary);
}
.variable-desc {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
.variable-example {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}
/* Console日志弹框 */
.console-dialog-content {
  display: flex;
  flex-direction: column;
}
.console-logs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}
.console-logs-list::-webkit-scrollbar {
  width: 6px;
}
.console-logs-list::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
}
.console-logs-list::-webkit-scrollbar-thumb {
  background: var(--border-base);
  border-radius: var(--border-radius-sm);
}
.console-logs-list::-webkit-scrollbar-thumb:hover {
  background: var(--border-light);
}
.console-log-item {
  border-radius: var(--border-radius-base);
  padding: 12px;
  background: var(--bg-secondary);
  border-left: 3px solid var(--border-base);
  transition: all 0.2s ease;
}
.console-log-item:hover {
  background: var(--bg-hover);
}
.console-log-item.level-error {
  border-left-color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}
.console-log-item.level-error:hover {
  background: var(--el-color-danger-light-8);
}
.console-log-item.level-warn {
  border-left-color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}
.console-log-item.level-warn:hover {
  background: var(--el-color-warning-light-8);
}
.console-log-item.level-info {
  border-left-color: var(--el-color-info);
  background: var(--el-color-info-light-9);
}
.console-log-item.level-info:hover {
  background: var(--el-color-info-light-8);
}
.console-log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.console-log-icon {
  flex-shrink: 0;
}
.console-log-item.level-error .console-log-icon {
  color: var(--el-color-danger);
}
.console-log-item.level-warn .console-log-icon {
  color: var(--el-color-warning);
}
.console-log-item.level-info .console-log-icon {
  color: var(--el-color-info);
}
.console-log-level {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  background: var(--bg-primary);
}
.console-log-item.level-error .console-log-level {
  color: var(--el-color-danger);
}
.console-log-item.level-warn .console-log-level {
  color: var(--el-color-warning);
}
.console-log-item.level-info .console-log-level {
  color: var(--el-color-info);
}
.console-log-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-left: auto;
}
.console-log-content {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  word-break: break-word;
}
.console-log-content pre {
  margin: 0;
  padding: 8px;
  background: var(--bg-primary);
  border-radius: var(--border-radius-sm);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: var(--font-size-xs);
  white-space: pre-wrap;
  word-break: break-all;
}
/* 详细视图 */
.detailed-log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detailed-log-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  padding: 16px;
  transition: box-shadow 0.2s ease;
}
.detailed-log-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.detailed-log-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-base);
}
.header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.log-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-family: 'Consolas', 'Monaco', monospace;
}
.log-method {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  background: var(--bg-primary);
}
.method-get {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.method-post {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.method-put {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}
.method-delete {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}
.method-patch {
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
}
.log-url {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 500;
  word-break: break-all;
  font-family: 'Consolas', 'Monaco', monospace;
}
.log-status {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.meta-item {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
.console-badge-inline {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  background: var(--el-color-info-light-8);
  color: var(--el-color-info);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}
.console-badge-inline:hover {
  background: var(--el-color-info-light-7);
}
.console-badge-inline.has-warn {
  background: var(--el-color-warning-light-8);
  color: var(--el-color-warning-dark-2);
}
.console-badge-inline.has-warn:hover {
  background: var(--el-color-warning-light-7);
}
.console-badge-inline.has-error {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger-dark-2);
}
.console-badge-inline.has-error:hover {
  background: var(--el-color-danger-light-7);
}
.detailed-collapse {
  border: none;
}
.detailed-collapse :deep(.el-collapse-item__header) {
  background: var(--bg-primary);
  border: none;
  padding: 8px 12px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}
.detailed-collapse :deep(.el-collapse-item__wrap) {
  background: var(--bg-primary);
  border: none;
}
.detailed-collapse :deep(.el-collapse-item__content) {
  padding: 12px;
}
.content-type-hint {
  margin-left: 8px;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-weight: normal;
}
.headers-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
  font-size: var(--font-size-xs);
  font-family: 'Consolas', 'Monaco', monospace;
}
.header-key {
  color: var(--text-secondary);
  font-weight: 600;
  word-break: break-word;
}
.header-value {
  color: var(--text-primary);
  word-break: break-all;
}
.body-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.empty-hint,
.error-hint {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
}
.error-hint {
  color: var(--danger-color);
  background: var(--el-color-danger-light-9);
}
.json-body,
.raw-body {
  margin: 0;
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-sm);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: var(--font-size-xs);
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-primary);
  max-height: 400px;
  overflow-y: auto;
}
.urlencoded-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.urlencoded-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-sm);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: var(--font-size-xs);
}
.field-key {
  color: var(--text-secondary);
  font-weight: 600;
}
.field-separator {
  color: var(--text-tertiary);
}
.field-value {
  color: var(--text-primary);
  word-break: break-all;
}
.formdata-table {
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}
.table-header {
  display: grid;
  grid-template-columns: 200px 1fr;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-base);
}
.table-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid var(--border-base);
}
.table-row:last-child {
  border-bottom: none;
}
.table-cell {
  padding: 8px 12px;
  font-size: var(--font-size-xs);
  word-break: break-all;
}
.table-header .table-cell {
  font-weight: 600;
  color: var(--text-secondary);
}
.table-row .table-cell {
  color: var(--text-primary);
}
.table-row .table-cell:first-child {
  background: var(--bg-secondary);
  font-weight: 500;
}
</style>
