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
            <button class="side-add-btn" type="button" :title="t('新建环境')" @click="handleCreateEnvironment">
              <Plus :size="14" />
            </button>
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
              <span class="env-item-name" @dblclick.stop="handleStartEditEnvironmentName(item.id)">
                <input
                  v-if="editingEnvironmentId === item.id"
                  :data-env-edit-id="item.id"
                  class="env-item-input"
                  :value="item.name"
                  @blur="handleFinishEditEnvironmentName(item.id, $event)"
                  @keydown.enter.prevent="handleSubmitEnvironmentName($event)"
                  @click.stop
                />
                <span v-else>{{ item.name || t('未命名环境') }}</span>
              </span>
              <div class="env-item-actions">
                <span v-if="activeEnvironmentId === item.id" class="env-item-tag">{{ t('当前使用') }}</span>
                <button class="env-action-btn" type="button" :title="t('生成副本')" @click.stop="handleDuplicateEnvironment(item.id)">
                  <Copy :size="14" />
                </button>
                <button
                  class="env-action-btn"
                  type="button"
                  :title="t('删除')"
                  :disabled="deletingEnvironmentId === item.id"
                  @click.stop="handleDeleteEnvironment(item.id)"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </button>
          </div>
          <div v-else class="env-list-empty">
            <FolderPlus :size="32" class="env-list-empty-icon" />
            <span class="env-list-empty-title">{{ t('无可用环境') }}</span>
            <span class="env-list-empty-desc">{{ t('请点击右上角新建') }}</span>
          </div>
        </aside>
        <section v-if="selectedEnvironment" class="env-manage-main">
          <div class="meta-grid">
            <label class="meta-field">
              <span class="meta-label">{{ t('环境名称') }}</span>
              <input type="text" :value="selectedEnvironment.name" @change="handleUpdateSelectedEnvironmentName" />
            </label>
            <label class="meta-field">
              <span class="meta-label">{{ t('Base URL') }}</span>
              <input type="text" :value="selectedEnvironment.baseUrl" @change="handleUpdateSelectedEnvironmentBaseUrl" />
            </label>
            <label class="meta-field desc">
              <span class="meta-label">{{ t('描述') }}</span>
              <textarea :value="selectedEnvironment.description" @change="handleUpdateSelectedEnvironmentDescription"></textarea>
            </label>
          </div>
          <div class="table-toolbar">
            <div class="table-toolbar-right">
              <div v-if="!isStandalone" class="value-mode-dropdown">
                <el-dropdown trigger="click" popper-class="env-visibility-popper" @command="handleChangeVariableValueMode">
                  <button class="value-mode-trigger" type="button">
                    <Users v-if="selectedEnvironment.visibilityMode === 'shared'" :size="14" />
                    <Lock v-else :size="14" />
                    <span class="value-mode-main">{{ selectedEnvironment.visibilityMode === 'shared' ? t('团队可见') : t('仅自己可见') }}</span>
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
              <button class="table-add-btn" type="button" @click="handleAddVariable">
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
                    <input type="text" :value="item.key" @change="handleUpdateVariableKey(item.id, $event)" />
                  </td>
                  <td>
                    <template v-if="item.valueType === 'secret'">
                      <div class="secret-cell">
                        <input
                          :type="isLocalSecretVisible(item.id) ? 'text' : 'password'"
                          :value="item.localValue"
                          @change="handleUpdateVariableValue(item.id, 'local', $event)"
                        />
                        <button class="icon-btn" type="button" @click="handleToggleVariableSecret(item.id, 'local')">
                          <Eye v-if="!isLocalSecretVisible(item.id)" :size="14" />
                          <EyeOff v-else :size="14" />
                        </button>
                      </div>
                    </template>
                    <input
                      v-else
                      type="text"
                      :value="item.localValue"
                      @change="handleUpdateVariableValue(item.id, 'local', $event)"
                    />
                  </td>
                  <td v-if="showSharedColumn">
                    <template v-if="item.valueType === 'secret'">
                      <div class="secret-cell">
                        <input
                          :type="isSharedSecretVisible(item.id) ? 'text' : 'password'"
                          :value="item.sharedValue"
                          :placeholder="t('无环境')"
                          @change="handleUpdateVariableValue(item.id, 'shared', $event)"
                        />
                        <button class="icon-btn" type="button" @click="handleToggleVariableSecret(item.id, 'shared')">
                          <Eye v-if="!isSharedSecretVisible(item.id)" :size="14" />
                          <EyeOff v-else :size="14" />
                        </button>
                      </div>
                    </template>
                    <input
                      v-else
                      type="text"
                      :value="item.sharedValue"
                      :placeholder="t('无环境')"
                      @change="handleUpdateVariableValue(item.id, 'shared', $event)"
                    />
                  </td>
                  <td>
                    <select :value="item.valueType" @change="handleUpdateVariableType(item.id, $event)">
                      <option value="text">text</option>
                      <option value="secret">secret</option>
                    </select>
                  </td>
                  <td class="operation-col">
                    <button class="icon-btn" type="button" @click="handleDeleteVariable(item.id)">
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
          <div class="main-empty">
            <div class="empty-card">
              <div class="empty-illustration">
                <Server :size="48" />
              </div>
              <h3 class="empty-title">{{ t('创建第一个环境开始管理变量') }}</h3>
              <p class="empty-desc">{{ t('创建环境后可配置 Base URL、变量与可见范围。') }}</p>
              <button class="empty-create-btn" type="button" @click="handleCreateEnvironment">
                <Plus :size="14" />
                <span>{{ t('新建环境') }}</span>
              </button>
            </div>
          </div>
        </section>
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
  FolderPlus,
  Eye,
  EyeOff,
  Trash2,
  ShieldAlert,
  Users,
  Lock,
  ChevronDown,
  Server,
  X
} from 'lucide-vue-next'
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRuntime } from '@/store/runtime/runtimeStore'
import { useEnvironment } from '@/store/projectWorkbench/environmentStore'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { t } = useI18n()
const runtimeStore = useRuntime()
const environmentStore = useEnvironment()
const {
  environmentList,
  environmentVariableMap,
  activeEnvironmentId,
} = storeToRefs(environmentStore)
const isStandalone = computed(() => runtimeStore.networkMode === 'offline')
const editingEnvironmentId = ref('')
const selectedEnvironmentId = ref('')
const deletingEnvironmentId = ref('')
const localSecretVisibleMap = ref<Record<string, boolean>>({})
const sharedSecretVisibleMap = ref<Record<string, boolean>>({})
const showSharedColumn = computed(() => !isStandalone.value)
const selectedEnvironment = computed(() => {
  return environmentList.value.find(item => item.id === selectedEnvironmentId.value) || null
})
const variableRows = computed(() => {
  if (!selectedEnvironmentId.value) {
    return []
  }
  return (environmentVariableMap.value[selectedEnvironmentId.value] || []).slice().sort((a, b) => a.order - b.order)
})

const handleClose = () => {
  emit('update:modelValue', false)
}
const handleCreateEnvironment = async () => {
  const createdEnvironmentId = await environmentStore.createEnvironment(t('未命名环境'))
  if (!createdEnvironmentId) {
    ElMessage.error(t('操作失败'))
    return
  }
  selectedEnvironmentId.value = createdEnvironmentId
  editingEnvironmentId.value = createdEnvironmentId
  nextTick(() => {
    const input = document.querySelector(`[data-env-edit-id="${createdEnvironmentId}"]`) as HTMLInputElement | null
    input?.focus()
    input?.select()
  })
}
const handleStartEditEnvironmentName = (id: string) => {
  editingEnvironmentId.value = id
  nextTick(() => {
    const input = document.querySelector(`[data-env-edit-id="${id}"]`) as HTMLInputElement | null
    input?.focus()
    input?.select()
  })
}
const handleSubmitEnvironmentName = (event: Event) => {
  const target = event.target as HTMLInputElement
  target.blur()
}
const handleSelectEnvironment = (id: string) => {
  selectedEnvironmentId.value = id
  environmentStore.setActiveEnvironment(id)
  editingEnvironmentId.value = ''
}
const handleFinishEditEnvironmentName = async (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const nextName = target.value.trim() || t('未命名环境')
  const saved = await environmentStore.updateEnvironment(id, { name: nextName })
  if (!saved) {
    ElMessage.error(t('保存失败'))
  }
  editingEnvironmentId.value = ''
}
const handleDuplicateEnvironment = async (id: string) => {
  const duplicateEnvironmentId = await environmentStore.duplicateEnvironment(id, t('生成副本'))
  if (!duplicateEnvironmentId) {
    ElMessage.error(t('操作失败'))
    return
  }
  selectedEnvironmentId.value = duplicateEnvironmentId
  editingEnvironmentId.value = ''
}
const handleDeleteEnvironment = async (id: string) => {
  if (deletingEnvironmentId.value) {
    return
  }
  const matched = environmentList.value.find(item => item.id === id)
  const environmentName = matched?.name?.trim() || t('未命名环境')
  try {
    await ElMessageBox.confirm(
      t('确定删除环境 "{name}" 吗？', { name: environmentName }),
      t('删除确认'),
      {
        confirmButtonText: t('删除'),
        cancelButtonText: t('取消'),
        type: 'warning',
        autofocus: false,
      }
    )
  } catch {
    return
  }
  deletingEnvironmentId.value = id
  try {
    const deleted = await environmentStore.deleteEnvironment(id)
    if (!deleted) {
      ElMessage.error(t('操作失败'))
      return
    }
    if (editingEnvironmentId.value === id) {
      editingEnvironmentId.value = ''
    }
    selectedEnvironmentId.value = activeEnvironmentId.value || environmentList.value[0]?.id || ''
  } finally {
    deletingEnvironmentId.value = ''
  }
}
const handleUpdateSelectedEnvironmentName = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!selectedEnvironment.value) {
    return
  }
  const saved = await environmentStore.updateEnvironment(selectedEnvironment.value.id, { name: target.value })
  if (!saved) {
    ElMessage.error(t('保存失败'))
  }
}
const handleUpdateSelectedEnvironmentBaseUrl = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!selectedEnvironment.value) {
    return
  }
  const saved = await environmentStore.updateEnvironment(selectedEnvironment.value.id, { baseUrl: target.value })
  if (!saved) {
    ElMessage.error(t('保存失败'))
  }
}
const handleUpdateSelectedEnvironmentDescription = async (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  if (!selectedEnvironment.value) {
    return
  }
  const saved = await environmentStore.updateEnvironment(selectedEnvironment.value.id, { description: target.value })
  if (!saved) {
    ElMessage.error(t('保存失败'))
  }
}
const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value)
}
const handleChangeVariableValueMode = async (mode: string | number | object) => {
  if (mode !== 'shared' && mode !== 'private') {
    return
  }
  if (!selectedEnvironment.value) {
    return
  }
  const saved = await environmentStore.updateEnvironment(selectedEnvironment.value.id, { visibilityMode: mode })
  if (!saved) {
    ElMessage.error(t('保存失败'))
  }
}
const handleUpdateVariableEnabled = async (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  if (!selectedEnvironment.value) {
    return
  }
  const saved = await environmentStore.updateVariable(selectedEnvironment.value.id, id, { enabled: target.checked })
  if (!saved) {
    ElMessage.error(t('保存失败'))
  }
}
const handleUpdateVariableKey = async (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  if (!selectedEnvironment.value) {
    return
  }
  const saved = await environmentStore.updateVariable(selectedEnvironment.value.id, id, { key: target.value })
  if (!saved) {
    ElMessage.error(t('保存失败'))
  }
}
const handleUpdateVariableValue = async (id: string, field: 'local' | 'shared', event: Event) => {
  const target = event.target as HTMLInputElement
  if (!selectedEnvironment.value) {
    return
  }
  if (field === 'local') {
    const saved = await environmentStore.updateVariable(selectedEnvironment.value.id, id, { localValue: target.value })
    if (!saved) {
      ElMessage.error(t('保存失败'))
    }
    return
  }
  const saved = await environmentStore.updateVariable(selectedEnvironment.value.id, id, { sharedValue: target.value })
  if (!saved) {
    ElMessage.error(t('保存失败'))
  }
}
const handleUpdateVariableType = async (id: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  if (!selectedEnvironment.value) {
    return
  }
  const valueType = target.value === 'secret' ? 'secret' : 'text'
  const saved = await environmentStore.updateVariable(selectedEnvironment.value.id, id, { valueType })
  if (!saved) {
    ElMessage.error(t('保存失败'))
    return
  }
  if (valueType === 'text') {
    localSecretVisibleMap.value[id] = false
    sharedSecretVisibleMap.value[id] = false
  }
}
const handleToggleVariableSecret = (id: string, field: 'local' | 'shared') => {
  if (field === 'local') {
    localSecretVisibleMap.value[id] = !localSecretVisibleMap.value[id]
    return
  }
  sharedSecretVisibleMap.value[id] = !sharedSecretVisibleMap.value[id]
}
const isLocalSecretVisible = (id: string): boolean => {
  return localSecretVisibleMap.value[id] === true
}
const isSharedSecretVisible = (id: string): boolean => {
  return sharedSecretVisibleMap.value[id] === true
}
const handleAddVariable = async () => {
  if (!selectedEnvironment.value) {
    return
  }
  const addedVariableId = await environmentStore.addVariable(selectedEnvironment.value.id)
  if (!addedVariableId) {
    ElMessage.error(t('操作失败'))
  }
}
const handleDeleteVariable = async (id: string) => {
  if (!selectedEnvironment.value) {
    return
  }
  const saved = await environmentStore.deleteVariable(selectedEnvironment.value.id, id)
  if (!saved) {
    ElMessage.error(t('操作失败'))
  }
}
watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      editingEnvironmentId.value = ''
      return
    }
    selectedEnvironmentId.value = activeEnvironmentId.value || environmentList.value[0]?.id || ''
  },
  { immediate: true }
)
watch(
  () => environmentList.value.map(item => item.id).join('|'),
  () => {
    if (!selectedEnvironmentId.value) {
      selectedEnvironmentId.value = activeEnvironmentId.value || environmentList.value[0]?.id || ''
      return
    }
    const exists = environmentList.value.some(item => item.id === selectedEnvironmentId.value)
    if (!exists) {
      selectedEnvironmentId.value = activeEnvironmentId.value || environmentList.value[0]?.id || ''
    }
  },
  { immediate: true }
)
watch(
  () => variableRows.value.map(item => `${item.id}:${item.valueType}`).join('|'),
  () => {
    const variableIdSet = new Set(variableRows.value.map(item => item.id))
    Object.keys(localSecretVisibleMap.value).forEach(id => {
      if (!variableIdSet.has(id)) {
        delete localSecretVisibleMap.value[id]
      }
    })
    Object.keys(sharedSecretVisibleMap.value).forEach(id => {
      if (!variableIdSet.has(id)) {
        delete sharedSecretVisibleMap.value[id]
      }
    })
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
:deep(.env-manage-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 10px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
}
:deep(.env-manage-dialog .el-dialog__header) {
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}
:deep(.env-manage-dialog .el-dialog__body) {
  padding: 0;
}
.env-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.env-dialog-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 500;
}
.env-dialog-close {
  width: 24px;
  height: 24px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: none;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: #0f172a;
    background: #f8fafc;
  }
}
.env-manage {
  .env-manage-content {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 540px;
    background: #ffffff;
  }
  .env-manage-side {
    background: #fafafa;
    border-right: 1px solid #e2e8f0;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 10px;
  }
  .side-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 40px;
    gap: 8px;
    padding: 12px 16px 0;
  }
  .side-title {
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
  }
  .side-add-btn {
    width: 26px;
    height: 26px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: none;
    color: #64748b;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      color: #0f172a;
      background: #e4e4e7;
    }
  }
  .env-list {
    display: grid;
    gap: 6px;
    align-content: start;
    overflow-y: auto;
    padding: 0 12px 12px;
  }
  .env-list-empty {
    height: 100%;
    color: #64748b;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 24px 16px;
  }
  .env-list-empty-icon {
    color: #94a3b8;
    opacity: 0.6;
    margin-bottom: 6px;
  }
  .env-list-empty-title {
    font-size: 13px;
    text-align: center;
    line-height: 1.5;
  }
  .env-list-empty-desc {
    font-size: 13px;
    text-align: center;
    line-height: 1.5;
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
    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
      color: #9ca3af;
      background: transparent;
      border-color: transparent;
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
    padding: 14px 16px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }
  .main-empty {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .empty-card {
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .empty-illustration {
    width: 120px;
    height: 120px;
    border-radius: 999px;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    color: #3b82f6;
    position: relative;
    box-shadow:
      inset 0 2px 4px rgb(255 255 255 / 0.5),
      0 8px 16px -4px rgb(59 130 246 / 0.12);
    &::before,
    &::after {
      content: '';
      position: absolute;
      border-radius: 999px;
      background: #3b82f6;
      opacity: 0.1;
    }
    &::before {
      width: 24px;
      height: 24px;
      top: 10px;
      right: 15px;
    }
    &::after {
      width: 16px;
      height: 16px;
      left: 15px;
      bottom: 20px;
    }
  }
  .empty-title {
    margin: 0 0 12px;
    color: #0f172a;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .empty-desc {
    margin: 0 0 32px;
    color: #64748b;
    font-size: 14px;
    line-height: 1.6;
  }
  .empty-create-btn {
    height: 40px;
    border: 1px solid #3b82f6;
    border-radius: 8px;
    background: #3b82f6;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgb(59 130 246 / 0.3);
    &:hover {
      border-color: #2563eb;
      background: #2563eb;
      color: #ffffff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgb(59 130 246 / 0.4);
    }
    &:active {
      transform: translateY(0);
    }
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
