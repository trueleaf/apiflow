<template>
  <el-dialog
    :model-value="modelValue"
    width="78vw"
    top="6vh"
    :close-on-click-modal="false"
    :show-close="false"
    class="env-manage-dialog"
    @close="handleClose"
    @update:model-value="handleUpdateModelValue"
  >
    <template #header>
      <div class="env-dialog-header">
        <span class="env-dialog-title">{{ t('环境管理') }}</span>
        <button class="env-dialog-close" type="button" :aria-label="t('关闭')" @click="handleClose">
          <X :size="16" />
        </button>
      </div>
    </template>
    <div class="env-manage">
      <div class="env-manage-content">
        <aside class="env-manage-side">
          <div class="side-head">
            <span class="side-title">{{ t('环境列表') }}</span>
          </div>
          <div v-if="environmentList.length > 0" class="env-list">
            <button
              v-for="item in environmentList"
              :key="item.id"
              class="env-item"
              :class="{ active: selectedEnvironmentId === item.id }"
              type="button"
              @click="handleSelectEnvironment(item.id)"
            >
              <span class="env-item-name">
                <input
                  v-if="editingEnvironmentId === item.id"
                  :data-env-edit-id="item.id"
                  class="env-item-input"
                  :value="item.name"
                  @input="handleUpdateEnvironmentName(item.id, $event)"
                  @blur="handleFinishEditEnvironmentName(item.id)"
                  @keydown.enter="handleFinishEditEnvironmentName(item.id)"
                  @click.stop
                />
                <span v-else>{{ item.name }}</span>
              </span>
              <div class="env-item-actions">
                <span v-if="selectedEnvironmentId === item.id" class="env-item-tag">{{ t('当前使用') }}</span>
                <button class="env-action-btn" type="button" :title="t('生成副本')" @click.stop="handleDuplicateEnvironment(item.id)">
                  <Copy :size="14" />
                </button>
                <button class="env-action-btn" type="button" :title="t('删除')" @click.stop="handleDeleteEnvironment(item.id)">
                  <Trash2 :size="14" />
                </button>
              </div>
            </button>
          </div>
          <div v-else class="env-list-empty">
            <span>{{ t('暂无环境，请先新建环境') }}</span>
          </div>
        </aside>
        <section v-if="selectedEnvironment" class="env-manage-main">
          <div class="meta-grid">
            <label class="meta-field">
              <span class="meta-label">{{ t('环境名称') }}</span>
              <input type="text" :value="selectedEnvironment.name" @input="handleUpdateSelectedEnvironmentName" />
            </label>
            <label class="meta-field">
              <span class="meta-label">{{ t('Base URL') }}</span>
              <input type="text" :value="selectedEnvironment.baseUrl" @input="handleUpdateSelectedEnvironmentBaseUrl" />
            </label>
            <label class="meta-field desc">
              <span class="meta-label">{{ t('描述') }}</span>
              <textarea :value="selectedEnvironment.description" @input="handleUpdateSelectedEnvironmentDescription"></textarea>
            </label>
          </div>
          <div class="table-toolbar">
            <div class="table-toolbar-right">
              <div v-if="!isStandalone" class="value-mode-dropdown">
                <el-dropdown trigger="click" popper-class="env-visibility-popper" @command="handleChangeVariableValueMode">
                  <button class="value-mode-trigger" type="button">
                    <Users v-if="variableValueMode === 'shared'" :size="14" />
                    <Lock v-else :size="14" />
                    <span class="value-mode-main">{{ variableValueMode === 'shared' ? t('团队可见') : t('仅自己可见') }}</span>
                    <ChevronDown :size="14" />
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="shared">
                        <div class="value-mode-option">
                          <Users :size="14" />
                          <span class="value-mode-option-text">
                            <span class="value-mode-option-main">{{ t('团队可见') }}</span>
                            <span class="value-mode-option-sub">{{ t('其他团队成员可见') }}</span>
                          </span>
                        </div>
                      </el-dropdown-item>
                      <el-dropdown-item command="private">
                        <div class="value-mode-option">
                          <Lock :size="14" />
                          <span class="value-mode-option-text">
                            <span class="value-mode-option-main">{{ t('仅自己可见') }}</span>
                            <span class="value-mode-option-sub">{{ t('仅你自己可见') }}</span>
                          </span>
                        </div>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <button class="table-add-btn" type="button">
                <Plus :size="14" />
                <span>{{ t('新增变量') }}</span>
              </button>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="switch-col">{{ t('启用') }}</th>
                  <th>{{ t('变量名称') }}</th>
                  <th>{{ t('本地值（Local）') }}</th>
                  <th v-if="showSharedColumn">
                    <span class="shared-head">
                      <span>{{ t('团队可见值（Shared）') }}</span>
                      <el-popover trigger="click" placement="top" :width="320">
                        <template #reference>
                          <button class="table-head-tip" type="button" :aria-label="t('什么是共享值')">
                            <CircleHelp :size="14" />
                          </button>
                        </template>
                        <div class="shared-tip-popover">
                          <div class="shared-tip-title">{{ t('什么是共享值') }}</div>
                          <div class="shared-tip-desc">{{ t('团队可见值说明示例') }}</div>
                        </div>
                      </el-popover>
                    </span>
                  </th>
                  <th>{{ t('类型') }}</th>
                  <th class="operation-col">{{ t('操作') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in variableRows" :key="item.id">
                  <td class="switch-col">
                    <input type="checkbox" :checked="item.enabled" @change="handleUpdateVariableEnabled(item.id, $event)" />
                  </td>
                  <td>
                    <input type="text" :value="item.key" @input="handleUpdateVariableKey(item.id, $event)" />
                  </td>
                  <td>
                    <template v-if="item.valueType === 'secret'">
                      <div class="secret-cell">
                        <input
                          :type="item.showLocalSecret ? 'text' : 'password'"
                          :value="item.localValue"
                          @input="handleUpdateVariableValue(item.id, 'local', $event)"
                        />
                        <button class="icon-btn" type="button" @click="handleToggleVariableSecret(item.id, 'local')">
                          <Eye v-if="!item.showLocalSecret" :size="14" />
                          <EyeOff v-else :size="14" />
                        </button>
                      </div>
                    </template>
                    <input
                      v-else
                      type="text"
                      :value="item.localValue"
                      @input="handleUpdateVariableValue(item.id, 'local', $event)"
                    />
                  </td>
                  <td v-if="showSharedColumn">
                    <template v-if="item.valueType === 'secret'">
                      <div class="secret-cell">
                        <input
                          :type="item.showSharedSecret ? 'text' : 'password'"
                          :value="item.sharedValue"
                          :placeholder="t('无环境')"
                          @input="handleUpdateVariableValue(item.id, 'shared', $event)"
                        />
                        <button class="icon-btn" type="button" @click="handleToggleVariableSecret(item.id, 'shared')">
                          <Eye v-if="!item.showSharedSecret" :size="14" />
                          <EyeOff v-else :size="14" />
                        </button>
                      </div>
                    </template>
                    <input
                      v-else
                      type="text"
                      :value="item.sharedValue"
                      :placeholder="t('无环境')"
                      @input="handleUpdateVariableValue(item.id, 'shared', $event)"
                    />
                  </td>
                  <td>
                    <select :value="item.valueType" @change="handleUpdateVariableType(item.id, $event)">
                      <option value="text">text</option>
                      <option value="secret">secret</option>
                    </select>
                  </td>
                  <td class="operation-col">
                    <button class="icon-btn" type="button">
                      <Trash2 :size="14" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="secret-tip">
            <ShieldAlert :size="14" />
            <span>{{ t('Secret 类型仅本地保存，导出时不携带真实值，降低泄露风险。') }}</span>
          </div>
        </section>
        <section v-else class="env-manage-main no-env-main">
          <span>{{ t('暂无环境，请先新建环境') }}</span>
        </section>
      </div>
      <div class="env-manage-footer">
        <span class="footer-dirty">{{ t('当前环境有未保存改动') }}</span>
        <div class="footer-actions">
          <button type="button" @click="handleClose">{{ t('取消') }}</button>
          <button type="button" class="primary">{{ t('保存') }}</button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  Plus,
  Copy,
  CircleHelp,
  Eye,
  EyeOff,
  Trash2,
  ShieldAlert,
  Users,
  Lock,
  ChevronDown,
  X
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRuntime } from '@/store/runtime/runtimeStore'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { t } = useI18n()
const runtimeStore = useRuntime()
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')
const environmentIdCounter = ref(4)
const environmentList = ref<Array<{ id: string; name: string; baseUrl: string; description: string }>>([
  {
    id: 'env_1',
    name: t('开发环境 dev'),
    baseUrl: 'https://api-dev.apiflow.dev',
    description: t('用于联调和回归验证，默认不影响生产数据。')
  },
  {
    id: 'env_2',
    name: t('测试环境 test'),
    baseUrl: 'https://api-test.apiflow.dev',
    description: t('用于联调和回归验证，默认不影响生产数据。')
  },
  {
    id: 'env_3',
    name: t('生产环境 prod'),
    baseUrl: 'https://api.apiflow.dev',
    description: t('用于联调和回归验证，默认不影响生产数据。')
  }
])
const selectedEnvironmentId = ref('env_2')
const editingEnvironmentId = ref('')
const variableValueMode = ref<'shared' | 'private'>('shared')
const variableRows = ref<Array<{
  id: string
  enabled: boolean
  key: string
  localValue: string
  sharedValue: string
  valueType: 'text' | 'secret'
  showLocalSecret: boolean
  showSharedSecret: boolean
}>>([
  {
    id: 'var_1',
    enabled: true,
    key: 'base_url',
    localValue: 'https://api-test.apiflow.dev',
    sharedValue: 'https://api.apiflow.dev',
    valueType: 'text',
    showLocalSecret: false,
    showSharedSecret: false
  },
  {
    id: 'var_2',
    enabled: true,
    key: 'token',
    localValue: 'apitoken-demo-123',
    sharedValue: '',
    valueType: 'secret',
    showLocalSecret: false,
    showSharedSecret: false
  }
])
const showSharedColumn = computed(() => !isStandalone.value)
const selectedEnvironment = computed(() => environmentList.value.find(item => item.id === selectedEnvironmentId.value) ?? null)

const handleClose = () => {
  emit('update:modelValue', false)
}
const handleSelectEnvironment = (id: string) => {
  selectedEnvironmentId.value = id
  editingEnvironmentId.value = ''
}
const handleUpdateEnvironmentName = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const currentEnvironment = environmentList.value.find(item => item.id === id)
  if (!currentEnvironment) {
    return
  }
  currentEnvironment.name = target.value
}
const handleFinishEditEnvironmentName = (id: string) => {
  const currentEnvironment = environmentList.value.find(item => item.id === id)
  if (!currentEnvironment) {
    editingEnvironmentId.value = ''
    return
  }
  const trimmedName = currentEnvironment.name.trim()
  currentEnvironment.name = trimmedName === '' ? t('未命名环境') : trimmedName
  editingEnvironmentId.value = ''
}
const handleDuplicateEnvironment = (id: string) => {
  const currentIndex = environmentList.value.findIndex(item => item.id === id)
  if (currentIndex < 0) {
    return
  }
  const currentEnvironment = environmentList.value[currentIndex]
  const duplicateEnvironmentId = `env_${environmentIdCounter.value}`
  environmentIdCounter.value += 1
  const duplicateEnvironment = {
    id: duplicateEnvironmentId,
    name: `${currentEnvironment.name} ${t('生成副本')}`,
    baseUrl: currentEnvironment.baseUrl,
    description: currentEnvironment.description
  }
  environmentList.value.splice(currentIndex + 1, 0, duplicateEnvironment)
  selectedEnvironmentId.value = duplicateEnvironmentId
  editingEnvironmentId.value = ''
}
const handleDeleteEnvironment = (id: string) => {
  const currentIndex = environmentList.value.findIndex(item => item.id === id)
  if (currentIndex < 0) {
    return
  }
  environmentList.value.splice(currentIndex, 1)
  if (environmentList.value.length === 0) {
    selectedEnvironmentId.value = ''
    editingEnvironmentId.value = ''
    return
  }
  if (selectedEnvironmentId.value === id) {
    const nextIndex = currentIndex >= environmentList.value.length ? environmentList.value.length - 1 : currentIndex
    selectedEnvironmentId.value = environmentList.value[nextIndex].id
  }
}
const handleUpdateSelectedEnvironmentName = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!selectedEnvironment.value) {
    return
  }
  selectedEnvironment.value.name = target.value
}
const handleUpdateSelectedEnvironmentBaseUrl = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!selectedEnvironment.value) {
    return
  }
  selectedEnvironment.value.baseUrl = target.value
}
const handleUpdateSelectedEnvironmentDescription = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  if (!selectedEnvironment.value) {
    return
  }
  selectedEnvironment.value.description = target.value
}
const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value)
}
const handleChangeVariableValueMode = (mode: string | number | object) => {
  if (mode !== 'shared' && mode !== 'private') {
    return
  }
  variableValueMode.value = mode
}
const handleUpdateVariableEnabled = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const currentVariable = variableRows.value.find(item => item.id === id)
  if (!currentVariable) {
    return
  }
  currentVariable.enabled = target.checked
}
const handleUpdateVariableKey = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const currentVariable = variableRows.value.find(item => item.id === id)
  if (!currentVariable) {
    return
  }
  currentVariable.key = target.value
}
const handleUpdateVariableValue = (id: string, field: 'local' | 'shared', event: Event) => {
  const target = event.target as HTMLInputElement
  const currentVariable = variableRows.value.find(item => item.id === id)
  if (!currentVariable) {
    return
  }
  if (field === 'local') {
    currentVariable.localValue = target.value
    return
  }
  currentVariable.sharedValue = target.value
}
const handleUpdateVariableType = (id: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  const currentVariable = variableRows.value.find(item => item.id === id)
  if (!currentVariable) {
    return
  }
  currentVariable.valueType = target.value === 'secret' ? 'secret' : 'text'
}
const handleToggleVariableSecret = (id: string, field: 'local' | 'shared') => {
  const currentVariable = variableRows.value.find(item => item.id === id)
  if (!currentVariable || currentVariable.valueType !== 'secret') {
    return
  }
  if (field === 'local') {
    currentVariable.showLocalSecret = !currentVariable.showLocalSecret
    return
  }
  currentVariable.showSharedSecret = !currentVariable.showSharedSecret
}
</script>
<style lang="scss" scoped>
.env-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.env-dialog-title {
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
}
.env-dialog-close {
  width: 24px;
  height: 24px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: #111827;
    background: #eef2f7;
    border-color: #e2e8f0;
  }
}
.env-manage {
  display: grid;
  gap: 11px;
  .env-manage-content {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: 520px;
    background: #ffffff;
  }
  .env-manage-side {
    background: #fafbfc;
    border-right: 1px solid #ebeef5;
    padding: 12px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 10px;
  }
  .side-head {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: 28px;
  }
  .side-title {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
  }
  .env-list {
    display: grid;
    gap: 6px;
    align-content: start;
    overflow-y: auto;
  }
  .env-list-empty {
    min-height: 140px;
    border: 1px dashed #d9dee8;
    border-radius: 6px;
    color: #6b7280;
    font-size: 12px;
    display: grid;
    place-items: center;
    gap: 8px;
    align-content: center;
  }
  .env-item {
    min-height: 38px;
    width: 100%;
    border: 1px solid #e6ebf2;
    border-radius: 6px;
    background: #ffffff;
    color: #4b5563;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      color: #111827;
      border-color: #cfd6e3;
      background: #fcfcfd;
    }
    &.active {
      color: #111827;
      border-color: #d8e2ff;
      background: #f2f6ff;
    }
  }
  .env-item-name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    text-align: left;
    min-width: 0;
  }
  .env-item-input {
    width: 100%;
    height: 28px;
    border: 1px solid #d9dee8;
    border-radius: 6px;
    background: #ffffff;
    color: #111827;
    padding: 0 8px;
    outline: none;
    &:focus {
      border-color: #b9c7e6;
    }
  }
  .env-item-actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .env-action-btn {
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: #6b7280;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      color: #111827;
      background: #eef2f7;
      border-color: #e2e8f0;
    }
  }
  .env-item-tag {
    height: 18px;
    border-radius: 10px;
    padding: 0 6px;
    font-size: 11px;
    color: #2f5bd3;
    background: #e8efff;
    display: inline-flex;
    align-items: center;
  }
  .env-manage-main {
    padding: 12px;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 10px;
    min-width: 0;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .meta-field {
    display: grid;
    gap: 6px;
    &.desc {
      grid-column: 1 / -1;
    }
    input,
    textarea {
      border: 1px solid #d9dee8;
      border-radius: 6px;
      background: #ffffff;
      color: #111827;
      font-family: inherit;
      font-size: 13px;
      line-height: 20px;
      padding: 0 10px;
      outline: none;
      transition: border-color 0.2s;
      &:focus {
        border-color: #b9c7e6;
      }
    }
    input {
      height: 34px;
    }
    textarea {
      min-height: 58px;
      resize: vertical;
      padding-top: 8px;
    }
  }
  .meta-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
  }
  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
  .table-toolbar-right {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .value-mode-dropdown {
    display: inline-flex;
    align-items: stretch;
  }
  .value-mode-trigger {
    min-width: 168px;
    height: 34px;
    border: 1px solid #d9dee8;
    border-radius: 6px;
    background: #ffffff;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #4b5563;
    padding: 0 8px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      color: #111827;
      border-color: #cfd6e3;
      background: #f8fafc;
    }
    > :last-child {
      margin-left: auto;
      color: #94a3b8;
    }
  }
  .value-mode-main {
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
  }
  .table-add-btn {
    height: 32px;
    border: 1px solid #d9dee8;
    border-radius: 6px;
    background: #ffffff;
    color: #4b5563;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      color: #111827;
      border-color: #cfd6e3;
      background: #f8fafc;
    }
  }
  .no-env-main {
    display: grid;
    place-items: center;
    font-size: 12px;
    color: #6b7280;
  }
  .table-wrap {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: auto;
    min-height: 240px;
    table {
      width: 100%;
      min-width: 760px;
      border-collapse: collapse;
    }
    th,
    td {
      border-bottom: 1px solid #eef1f6;
      padding: 8px;
      text-align: left;
      font-size: 12px;
      color: #4b5563;
      background: #ffffff;
    }
    th {
      font-weight: 600;
      background: #f8f9fb;
      color: #6b7280;
    }
    .shared-head {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .table-head-tip {
      width: 20px;
      height: 20px;
      border: 1px solid transparent;
      border-radius: 4px;
      background: transparent;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        color: #475569;
        background: #eef2f7;
        border-color: #e2e8f0;
      }
    }
    .shared-tip-popover {
      display: grid;
      gap: 6px;
    }
    .shared-tip-title {
      font-size: 13px;
      color: #111827;
      font-weight: 600;
    }
    .shared-tip-desc {
      font-size: 12px;
      line-height: 1.6;
      color: #6b7280;
    }
    tr:last-child td {
      border-bottom: none;
    }
    input,
    select {
      width: 100%;
      height: 30px;
      border: 1px solid #d9dee8;
      border-radius: 6px;
      background: #ffffff;
      color: #111827;
      padding: 0 8px;
      outline: none;
      &:focus {
        border-color: #b9c7e6;
      }
    }
  }
  .switch-col {
    width: 60px;
    text-align: center;
    input {
      width: 14px;
      height: 14px;
    }
  }
  .operation-col {
    width: 76px;
    text-align: center;
  }
  .secret-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    input {
      flex: 1;
      min-width: 0;
    }
    .icon-btn {
      flex-shrink: 0;
    }
  }
  .icon-btn {
    width: 30px;
    height: 30px;
    border: 1px solid #d9dee8;
    border-radius: 6px;
    background: #ffffff;
    color: #4b5563;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      color: #111827;
      border-color: #cfd6e3;
      background: #f8fafc;
    }
  }
  .secret-tip {
    border: 1px solid #fde3bb;
    border-radius: 6px;
    background: #fff8ee;
    color: #8a5b2a;
    font-size: 12px;
    line-height: 1.5;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .env-manage-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
  }
  .footer-dirty {
    font-size: 12px;
    color: #6b7280;
  }
  .footer-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    button {
      height: 32px;
      border: 1px solid #d9dee8;
      border-radius: 6px;
      background: #ffffff;
      color: #4b5563;
      padding: 0 12px;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        color: #111827;
        border-color: #cfd6e3;
        background: #f8fafc;
      }
      &.primary {
        color: #ffffff;
        border-color: #3b82f6;
        background: #3b82f6;
        &:hover {
          color: #ffffff;
          border-color: #2563eb;
          background: #2563eb;
        }
      }
    }
  }
}
@media screen and (max-width: 1100px) {
  .env-manage {
    .env-manage-content {
      grid-template-columns: 1fr;
    }
    .env-manage-side {
      border-right: none;
      border-bottom: 1px solid #ebeef5;
    }
    .meta-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
