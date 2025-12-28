<template>
  <el-dialog :model-value="modelValue" :title="t('导入用户')" :before-close="handleClose">
    <el-alert
      class="mb-3"
      type="warning"
      :closable="false"
      title="CSV: loginName,role (role: user|admin)"
    />
    <el-upload
      class="upload-area mb-3"
      drag
      action=""
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :http-request="handleUpload"
      accept=".csv"
    >
      <div class="upload-content">
        <div class="upload-text">
          {{ t('将文件拖到此处，或') }}<em>{{ t('点击上传') }}</em>
        </div>
        <div class="upload-hint">{{ t('支持 .csv 格式') }}</div>
      </div>
    </el-upload>

    <el-alert v-if="selectedFileName" class="mb-3" type="info" :closable="false" :title="selectedFileName" />

    <el-alert
      v-if="parseErrors.length"
      class="mb-3"
      type="warning"
      :closable="false"
      :title="`解析失败：${parseErrors.length} 条`"
    />
    <div v-if="parseErrors.length" class="error-list">
      <div v-for="item in parseErrors.slice(0, 20)" :key="`${item.line}-${item.msg}`" class="error-item">
        {{ item.line > 0 ? `Line ${item.line}: ${item.msg}` : item.msg }}
      </div>
      <div v-if="parseErrors.length > 20" class="error-item">...</div>
    </div>

    <el-alert
      v-if="!parseErrors.length && parsedUsers.length"
      class="mb-3"
      type="success"
      :closable="false"
      :title="`已解析 ${parsedUsers.length} 条`"
    />

    <el-table
      v-if="!parseErrors.length && parsedUsers.length"
      class="mb-3"
      size="small"
      border
      max-height="220"
      :data="parsedUsers"
    >
      <el-table-column prop="loginName" label="loginName" />
      <el-table-column prop="role" label="role" />
    </el-table>

    <el-alert
      v-if="importResult"
      class="mb-3"
      type="success"
      :closable="false"
      :title="`导入完成：成功 ${importResult.successCount}，失败 ${importResult.failCount}`"
    />
    <div v-if="importResult?.failCount" class="error-list">
      <div
        v-for="item in importResult.fails.slice(0, 20)"
        :key="`${item.index}-${item.loginName}`"
        class="error-item"
      >
        {{ `#${item.index + 1} ${item.loginName || '-'}: ${item.reason}` }}
      </div>
      <div v-if="importResult.fails.length > 20" class="error-item">...</div>
    </div>

    <template #footer>
      <div>
        <el-button @click="handleClose">{{ t('取消') }}</el-button>
        <el-button :loading="importing" type="primary" :disabled="isImportDisabled" @click="handleImport">
          {{ t('确定') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { request } from '@/api/api'
import type { CommonResponse } from '@src/types'
import { message } from '@/helper'

type ParsedUser = { loginName: string; role: string }
type ParseError = { line: number; msg: string }
type ImportResult = {
  successCount: number
  failCount: number
  fails: { index: number; loginName: string; reason: string }[]
}

const modelValue = defineModel<boolean>({ default: false })
const emit = defineEmits<{ (e: 'success'): void }>()
const { t } = useI18n()

const selectedFileName = ref('')
const parsedUsers = ref<ParsedUser[]>([])
const parseErrors = ref<ParseError[]>([])
const importing = ref(false)
const importResult = ref<ImportResult | null>(null)

const isImportDisabled = computed(() => {
  return importing.value || parseErrors.value.length > 0 || parsedUsers.value.length === 0
})

const parseCSV = (content: string): string[][] => {
  const rows: string[][] = []
  let currentCell = ''
  let currentRow: string[] = []
  let inQuotes = false
  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i]
    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          currentCell += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        currentCell += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      currentRow.push(currentCell.trim())
      currentCell = ''
      continue
    }
    if (ch === '\n') {
      currentRow.push(currentCell.trim())
      rows.push(currentRow)
      currentRow = []
      currentCell = ''
      continue
    }
    if (ch === '\r') continue
    currentCell += ch
  }
  if (currentCell.length || currentRow.length) {
    currentRow.push(currentCell.trim())
    rows.push(currentRow)
  }
  return rows.filter(r => r.some(cell => cell.trim() !== ''))
}

const resetState = () => {
  selectedFileName.value = ''
  parsedUsers.value = []
  parseErrors.value = []
  importResult.value = null
}

const handleBeforeUpload = (file: File) => {
  const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
  if (!isCsv) {
    message.warning('仅支持CSV文件')
    return false
  }
  return true
}

const handleUpload = async (options: { file: File }) => {
  resetState()
  selectedFileName.value = options.file.name

  const errors: ParseError[] = []
  const users: ParsedUser[] = []
  const duplicatedLoginNames = new Set<string>()
  const existedLoginNames = new Set<string>()

  try {
    const raw = await options.file.text()
    const content = raw.replace(/^\ufeff/, '')
    const rows = parseCSV(content)
    if (rows.length < 2) {
      errors.push({ line: 1, msg: 'CSV内容为空' })
      parseErrors.value = errors
      return raw
    }

    const headers = rows[0].map(h => h.trim())
    const headerToIndex = new Map<string, number>()
    headers.forEach((h, idx) => headerToIndex.set(h, idx))
    const loginNameIndex = headerToIndex.get('loginName') ?? headerToIndex.get(t('登录名称'))
    const roleIndex = headerToIndex.get('role') ?? headerToIndex.get('roleNames') ?? headerToIndex.get(t('角色信息'))
    if (loginNameIndex == null || roleIndex == null) {
      errors.push({ line: 1, msg: 'Header must include: loginName,role' })
      parseErrors.value = errors
      return raw
    }

    for (let i = 1; i < rows.length; i += 1) {
      const lineNumber = i + 1
      const row = rows[i]
      const loginName = (row[loginNameIndex] || '').trim()
      const roleRaw = (row[roleIndex] || '').trim()
      if (!loginName) {
        errors.push({ line: lineNumber, msg: t('用户名不能为空') })       
        continue
      }
      if (existedLoginNames.has(loginName)) {
        duplicatedLoginNames.add(loginName)
        continue
      }
      existedLoginNames.add(loginName)
      const roleItems = roleRaw
        .split('|')
        .map(v => v.trim().toLowerCase())
        .filter(Boolean)
      if (roleItems.length === 0) {
        errors.push({ line: lineNumber, msg: t('请完善必填信息') })       
        continue
      }
      const unknownRoles = roleItems.filter(r => r !== 'user' && r !== 'admin')
      if (unknownRoles.length) {
        errors.push({ line: lineNumber, msg: `Invalid role: ${unknownRoles.join('|')}` })
        continue
      }
      users.push({ loginName, role: roleItems.join('|') })
    }

    duplicatedLoginNames.forEach((name) => {
      errors.push({ line: 0, msg: `登录名称重复：${name}` })
    })
    parseErrors.value = errors
    parsedUsers.value = errors.length ? [] : users
    return raw
  } catch (err) {
    console.error(err)
    parseErrors.value = [{ line: 1, msg: t('文件解析失败') }]
    parsedUsers.value = []
    return ''
  }
}

const handleImport = () => {
  if (isImportDisabled.value) return
  importing.value = true
  importResult.value = null
  const payload = { users: parsedUsers.value }
  request.post<CommonResponse<ImportResult>, CommonResponse<ImportResult>>('/api/security/add_user_by_excel', payload)
    .then((res) => {
      importResult.value = res.data
      if (res.data.failCount) {
        message.warning(`导入完成：成功 ${res.data.successCount}，失败 ${res.data.failCount}`)
      } else {
        message.success('导入成功')
      }
      emit('success')
      if (!res.data.failCount) {
        handleClose()
      }
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      importing.value = false
    })
}

const handleClose = () => {
  modelValue.value = false
  resetState()
}

</script>

<style scoped lang="scss">
.upload-area {
  width: 100%;
  :deep(.el-upload) {
    width: 100%;
  }
  :deep(.el-upload-dragger) {
    width: 100%;
  }
}

.upload-content {
  text-align: center;
  .upload-text {
    font-size: 14px;
    color: var(--gray-600);
    em {
      color: var(--theme-color);
      font-style: normal;
      cursor: pointer;
    }
  }
  .upload-hint {
    font-size: 12px;
    color: var(--gray-400);
    margin-top: 4px;
  }
}

.error-list {
  max-height: 180px;
  overflow: auto;
  padding: 8px 10px;
  margin-bottom: 12px;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  background: var(--gray-50);
}
.error-item {
  font-size: 12px;
  line-height: 18px;
  color: var(--gray-700);
}
</style>
