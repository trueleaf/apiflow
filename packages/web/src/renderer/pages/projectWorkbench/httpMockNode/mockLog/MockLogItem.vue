<template>
  <div class="detailed-log-item">
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
        <span class="meta-item">IP: {{ log.data.ip }}</span>
        <span class="meta-item">响应时间: {{ log.data.responseTime ?? 0 }}ms</span>
        <ElButton size="small" @click="$emit('showFullData', log)" class="full-data-btn">
          完整数据
        </ElButton>
        <template v-if="getConsoleLogStats(log).total > 0">
          <span 
            class="console-badge-inline" 
            :class="{
              'has-error': getConsoleLogStats(log).errorCount > 0,
              'has-warn': getConsoleLogStats(log).warnCount > 0 && getConsoleLogStats(log).errorCount === 0,
            }"
            @click.stop="$emit('showConsoleLogs', log)"
          >
            Console: {{ getConsoleLogStats(log).total }}
          </span>
        </template>
      </div>
    </div>
    
    <div class="custom-collapse">
      <div class="collapse-header" @click="isHeadersExpanded = !isHeadersExpanded">
        <ChevronRight :size="16" class="arrow-icon" :class="{ 'is-expanded': isHeadersExpanded }" />
        <span>请求头</span>
      </div>
      <div v-show="isHeadersExpanded" class="collapse-content">
        <div class="headers-grid">
          <template v-for="(value, key) in log.data.headers" :key="key">
            <div class="header-key">{{ key }}</div>
            <div class="header-value">{{ value }}</div>
          </template>
        </div>
      </div>
    </div>
    
    <div class="custom-collapse">
      <div class="collapse-header" @click="isBodyExpanded = !isBodyExpanded">
        <ChevronRight :size="16" class="arrow-icon" :class="{ 'is-expanded': isBodyExpanded }" />
        <span>请求体</span>
        <span v-if="log.data.contentType" class="content-type-hint">
          ({{ log.data.contentType.split(';')[0] }})
        </span>
      </div>
      <div v-show="isBodyExpanded" class="collapse-content">
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
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { MockLog } from '@src/types/mockNode'
import { ChevronRight } from 'lucide-vue-next'
import { ElButton } from 'element-plus'

defineProps<{
  log: Extract<MockLog, { type: 'request' }>
}>()

defineEmits<{
  (e: 'showConsoleLogs', log: Extract<MockLog, { type: 'request' }>): void
  (e: 'showFullData', log: Extract<MockLog, { type: 'request' }>): void
}>()

const isHeadersExpanded = ref(true)
const isBodyExpanded = ref(true)

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

const getConsoleLogStats = (log: Extract<MockLog, { type: 'request' }>) => {
  const logs = log.data.consoleLogs || []
  return {
    total: logs.length,
    errorCount: logs.filter(l => l.level === 'error').length,
    warnCount: logs.filter(l => l.level === 'warn').length,
  }
}

const parseMultipartFormData = (body: string, contentType: string): Array<{ name: string; value: string; filename?: string }> => {
  try {
    const boundaryMatch = contentType.match(/boundary=([^;]+)/)
    if (!boundaryMatch) {
      return []
    }
    const boundary = boundaryMatch[1].trim()
    // 移除可能的引号
    const cleanBoundary = boundary.replace(/^["']|["']$/g, '')
    const parts = body.split(`--${cleanBoundary}`)
    const fields: Array<{ name: string; value: string; filename?: string }> = []
    
    for (const part of parts) {
      const trimmedPart = part.trim()
      if (!trimmedPart || trimmedPart === '--') {
        continue
      }
      
      // 查找头部结束位置（双换行）
      const headerEndIndex = part.search(/\r?\n\r?\n/)
      if (headerEndIndex === -1) {
        continue
      }
      
      const headers = part.substring(0, headerEndIndex)
      const content = part.substring(headerEndIndex).replace(/^\r?\n\r?\n/, '').trim()
      
      // 匹配 Content-Disposition，更宽松的正则
      const dispositionMatch = headers.match(/Content-Disposition:\s*form-data;\s*name="?([^";\r\n]+)"?(?:;\s*filename="?([^";\r\n]+)"?)?/i)
      
      if (dispositionMatch) {
        const name = dispositionMatch[1].trim()
        const filename = dispositionMatch[2]?.trim()
        
        // 处理二进制文件标识
        if (content.startsWith('[Binary File:')) {
          fields.push({
            name,
            value: content,
            filename
          })
        } else if (filename) {
          // 有文件名的字段
          fields.push({
            name,
            value: `[文件: ${filename}]`,
            filename
          })
        } else {
          // 普通文本字段
          const displayValue = content.length > 200 ? `${content.substring(0, 200)}...` : content
          fields.push({
            name,
            value: displayValue
          })
        }
      }
    }
    
    return fields
  } catch (error) {
    return []
  }
}

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
</script>

<style scoped>
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
  justify-content: flex-start;
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
.meta-item {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
.full-data-btn {
  margin-left: auto;
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

/* Custom Collapse Styles */
.custom-collapse {
  margin-bottom: 8px;
}
.collapse-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  user-select: none;
}
.collapse-header:hover {
  color: var(--primary-color);
}
.arrow-icon {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}
.arrow-icon.is-expanded {
  transform: rotate(90deg);
}
.collapse-content {
  padding: 8px 0 8px 24px;
}

.content-type-hint {
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
