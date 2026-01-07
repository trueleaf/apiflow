<template>
  <div class="shortcuts-settings">
    <div class="page-header">
      <h2>{{ t('快捷键') }}</h2>
    </div>

    <div class="search-bar">
      <div class="search-field">
        <Search class="search-icon" />
        <input
          v-model="searchQuery"
          :placeholder="t('搜索快捷键...')"
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''" :title="t('清空搜索')">
          <X class="clear-icon" />
        </button>
      </div>
      <button class="reset-all-btn" @click="handleResetAll" :disabled="!hasAnyCustomKeys">
        <RotateCcw class="btn-icon" />
        {{ t('重置所有') }}
      </button>
    </div>

    <div class="shortcuts-content">
      <div class="shortcuts-container">
        <div class="shortcuts-table">
          <div
            v-for="shortcut in filteredShortcuts"
            :key="shortcut.id"
            class="shortcut-row"
            :class="{ 'is-editing': editingShortcutId === shortcut.id }"
          >
            <div class="shortcut-info-cell">
              <div class="shortcut-name">
                {{ shortcut.name }}
              </div>
            </div>

            <div class="shortcut-keys-cell" v-if="editingShortcutId !== shortcut.id">
              <div class="keys-wrapper">
                <div class="keys-group">
                  <span v-if="shortcut.userSetKeys" class="keys-label">{{ t('自定义') }}</span>
                  <div class="keys-display" :class="{ custom: Boolean(shortcut.userSetKeys) }">
                    <div v-if="shortcut.userSetKeys" class="custom-icon">
                      <Sparkles class="icon" />
                    </div>
                    <div class="keys-list">
                      <template v-for="(key, index) in parseKeys(shortcut.userSetKeys || shortcut.defaultKeys)" :key="index">
                        <kbd v-if="key !== '+'" class="key">{{ key }}</kbd>
                        <span v-else class="key-separator">{{ key }}</span>
                      </template>
                    </div>
                  </div>
                </div>
                <div class="keys-group default-keys" v-if="shortcut.userSetKeys">
                  <span class="keys-label">{{ t('默认') }}</span>
                  <div class="keys-display">
                    <template v-for="(key, index) in parseKeys(shortcut.defaultKeys)" :key="index">
                      <kbd v-if="key !== '+'" class="key">{{ key }}</kbd>
                      <span v-else class="key-separator">{{ key }}</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div class="shortcut-keys-cell editing" v-else>
              <KeyRecorder
                v-model="editingKeys"
                :placeholder="t('按下新快捷键')"
                :conflict-message="conflictMessage"
                @change="handleKeysChange"
              />
            </div>

            <div class="shortcut-actions-cell" v-if="editingShortcutId !== shortcut.id">
              <button class="action-btn edit-btn" @click="handleEditShortcut(shortcut)" :title="t('编辑')">
                <Pencil class="btn-icon" />
              </button>
              <button 
                v-if="shortcut.userSetKeys" 
                class="action-btn reset-btn" 
                @click="handleResetSingle(shortcut)" 
                :title="t('重置为默认')"
              >
                <RotateCcw class="btn-icon" />
              </button>
            </div>

            <div class="shortcut-actions-cell editing" v-else>
              <button class="action-btn save-btn" @click="handleSaveEdit" :disabled="!canSave" :title="t('保存')">
                <Check class="btn-icon" />
              </button>
              <button class="action-btn cancel-btn" @click="handleCancelEdit" :title="t('取消')">
                <X class="btn-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredShortcuts.length === 0" class="empty-state">
        <Search class="empty-icon" />
        <div class="empty-text">{{ t('未找到匹配的快捷键') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ShortcutConfig } from '@src/types/shortcut'
import { shortcutManager } from '@/shortcut/index'
import KeyRecorder from './KeyRecorder.vue'
import { message } from '@/helper'
import { Pencil, Sparkles, Check, X, RotateCcw, Search } from 'lucide-vue-next'
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm'

const { t } = useI18n()

/* 响应式状态 */
const searchQuery = ref('')
const editingShortcutId = ref<string | null>(null)
const editingKeys = ref('')
const conflictMessage = ref('')
const shortcuts = ref<ShortcutConfig[]>([])

/* 计算属性 */
const filteredShortcuts = computed(() => {
  if (!searchQuery.value.trim()) {
    return shortcuts.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return shortcuts.value.filter(shortcut => {
    return (
      shortcut.name.toLowerCase().includes(query) ||
      formatKeyDisplay(shortcut).toLowerCase().includes(query)
    )
  })
})
const hasAnyCustomKeys = computed(() => {
  return shortcuts.value.some(s => s.userSetKeys)
})
const canSave = computed(() => {
  return editingKeys.value && !conflictMessage.value
})

/* 业务逻辑函数 */
const formatKeyDisplay = (shortcut: ShortcutConfig): string => {
  const keys = (shortcut.userSetKeys || shortcut.defaultKeys).split(',')[0]
  const parts = keys.split('+').map(key => {
    const keyMap: Record<string, string> = {
      'ctrl': 'Ctrl',
      'command': '⌘',
      'shift': 'Shift',
      'alt': 'Alt',
      'option': 'Option',
      'meta': 'Meta'
    }
    const lowerKey = key.toLowerCase().trim()
    if (keyMap[lowerKey]) {
      return keyMap[lowerKey]
    }
    return key.toUpperCase()
  })
  return parts.join(' + ')
}
const parseKeys = (keysString: string): string[] => {
  if (!keysString) return []
  const keys = keysString.split(',')[0]
  const keyParts = keys.split('+').map(key => {
    const keyMap: Record<string, string> = {
      'ctrl': 'Ctrl',
      'command': '⌘',
      'shift': 'Shift',
      'alt': 'Alt',
      'option': 'Option',
      'meta': 'Meta'
    }
    const lowerKey = key.toLowerCase().trim()
    if (keyMap[lowerKey]) {
      return keyMap[lowerKey]
    }
    return key.toUpperCase()
  })
  const result: string[] = []
  keyParts.forEach((key, index) => {
    result.push(key)
    if (index < keyParts.length - 1) {
      result.push('+')
    }
  })
  return result
}
const loadShortcuts = () => {
  shortcuts.value = shortcutManager.getAllShortcuts()
}

/* 事件处理函数 */
const handleEditShortcut = (shortcut: ShortcutConfig) => {
  editingShortcutId.value = shortcut.id
  editingKeys.value = shortcut.userSetKeys || shortcut.defaultKeys
  conflictMessage.value = ''
}
const handleKeysChange = (keys: string) => {
  const currentShortcut = shortcuts.value.find(s => s.id === editingShortcutId.value)
  if (!currentShortcut) {
    return
  }
  const conflict = shortcutManager.checkConflict(currentShortcut.id, keys)
  if (conflict) {
    conflictMessage.value = t('与 {name} 冲突', { name: conflict.existingShortcut.name })
  } else {
    conflictMessage.value = ''
  }
}
const handleSaveEdit = () => {
  if (!editingShortcutId.value || !canSave.value) {
    return
  }
  shortcutManager.updateShortcutKeys(editingShortcutId.value, editingKeys.value)
  loadShortcuts()
  message.success(t('快捷键保存成功'))
  handleCancelEdit()
}
const handleCancelEdit = () => {
  editingShortcutId.value = null
  editingKeys.value = ''
  conflictMessage.value = ''
}
const handleResetSingle = (shortcut: ShortcutConfig) => {
  ClConfirm({
    content: t('确定要重置该快捷键为默认值吗?'),
    title: t('确认重置'),
    confirmButtonText: t('确定/ShortcutsReset'),
    cancelButtonText: t('取消'),
    type: 'warning'
  }).then(() => {
    shortcutManager.resetShortcut(shortcut.id)
    loadShortcuts()
    message.success(t('已重置为默认快捷键'))
  }).catch(() => {
    // 取消操作
  })
}
const handleResetAll = () => {
  ClConfirm({
    content: t('确定要重置所有快捷键为默认值吗?'),
    title: t('确认重置'),
    confirmButtonText: t('确定/ShortcutsReset'),
    cancelButtonText: t('取消'),
    type: 'warning'
  }).then(() => {
    shortcutManager.resetAllShortcuts()
    loadShortcuts()
    message.success(t('已重置所有快捷键'))
  }).catch(() => {
    // 取消操作
  })
}

/* 生命周期 */
onMounted(() => {
  loadShortcuts()
})
</script>

<style lang="scss" scoped>
.shortcuts-settings {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 24px 24px;
  box-sizing: border-box;
  overflow-y: auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: baseline;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--text-gray-900);
      }

      .shortcuts-count {
        font-size: 13px;
        color: var(--text-gray-400);

        .customized-badge {
          color: var(--blue-500);
          font-weight: 500;
        }
      }
    }
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;

    .search-field {
      position: relative;
      flex: 1;
      min-width: 320px;
      max-width: 520px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--text-gray-400);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 10px 36px 10px 40px;
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      outline: none;
      font-size: 14px;
      color: var(--text-gray-900);
      background: var(--bg-primary);
      transition: border-color 0.2s, box-shadow 0.2s;

      &::placeholder {
        color: var(--text-gray-300);
      }

      &:focus {
        border-color: var(--blue-500);
        box-shadow: 0 0 0 3px var(--color-focus-ring);
      }
    }

    .clear-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      padding: 4px;
      border: none;
      background: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-gray-400);
      transition: color 0.2s;

      .clear-icon {
        width: 14px;
        height: 14px;
      }

      &:hover {
        color: var(--text-gray-700);
      }
    }

    .reset-all-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      background: var(--bg-primary);
      color: var(--text-gray-700);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;

      .btn-icon {
        width: 14px;
        height: 14px;
      }

      &:hover:not(:disabled) {
        color: var(--blue-500);
        border-color: var(--blue-500);
        background: var(--blue-100);
      }

      &:disabled {
        color: var(--text-gray-300);
        border-color: var(--bg-gray-400);
        cursor: not-allowed;
        background: var(--bg-gray-150);
      }
    }
  }

  .shortcuts-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .shortcuts-container {
    padding: 20px;
    background: var(--bg-primary);
    border: 1px solid var(--bg-gray-400);
    border-radius: 8px;

    .shortcuts-table {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: var(--bg-gray-150);
      border-radius: 4px;
      overflow: hidden;
    }
  }

  .shortcut-row {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg-primary);
    transition: background-color 0.2s;

    &:hover:not(.is-editing) {
      background: var(--bg-gray-50);
    }

    &.is-editing {
      background: var(--blue-50);
      border-left: 3px solid var(--blue-500);
      padding-left: 13px;
    }

    .shortcut-info-cell {
      flex: 1;
      min-width: 0;
      padding-right: 16px;

      .shortcut-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-gray-900);
        display: flex;
        align-items: center;
        gap: 8px;

        .shortcut-context {
          font-size: 12px;
          font-weight: 400;
          color: var(--text-gray-400);
        }
      }
    }

    .shortcut-keys-cell {
      flex: 0 0 auto;
      padding-right: 16px;

      &.editing {
        flex: 1;
        min-width: 0;
      }

      .keys-wrapper {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .keys-group {
        display: flex;
        align-items: center;
        gap: 8px;

        &.default-keys {
          .keys-label {
            color: var(--text-gray-400);
          }

          .keys-display {
            opacity: 0.6;
          }
        }

        .keys-label {
          font-size: 11px;
          color: var(--text-gray-700);
          font-weight: 500;
          min-width: 40px;
        }

        .keys-display {
          display: flex;
          align-items: center;
          gap: 8px;

          &.custom {
            padding: 6px 10px;
            border: 1px solid var(--blue-300);
            border-radius: 8px;
            background: var(--blue-50);

            .custom-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28px;
              height: 28px;
              border-radius: 6px;
              background: var(--bg-primary);
              border: 1px solid var(--border-gray-400);
              box-shadow: 0 2px 6px var(--shadow-md);

              .icon {
                width: 14px;
                height: 14px;
                color: var(--blue-500);
              }
            }
          }

          .keys-list {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
          }

          .key-separator {
            color: var(--text-gray-400);
            font-size: 12px;
            font-weight: 400;
            user-select: none;
          }

          .key {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            height: 24px;
            padding: 0 8px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-gray-700);
            background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-gray-150) 100%);
            border: 1px solid var(--el-border-color);
            border-radius: 4px;
            box-shadow: 0 1px 2px var(--shadow-sm);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;

            .keys-display.custom & {
              background: var(--bg-primary);
              border-color: var(--blue-300);
              color: var(--text-gray-900);
              box-shadow: 0 2px 4px var(--shadow-md);
            }
          }
        }
      }
    }

    .shortcut-actions-cell {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 8px;

      &.editing {
        gap: 12px;
      }

      .action-btn {
        padding: 6px;
        border: 1px solid transparent;
        border-radius: 4px;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        &.edit-btn {
          color: var(--text-gray-700);

          &:hover {
            color: var(--blue-500);
            background: var(--blue-100);
          }
        }

        &.reset-btn {
          color: var(--text-gray-400);

          &:hover {
            color: var(--el-color-warning);
            background: var(--bg-warning-light);
          }
        }

        &.save-btn {
          color: var(--el-color-success);
          border-color: var(--el-color-success);

          &:hover:not(:disabled) {
            background: var(--blue-50);
            border-color: var(--blue-500);
            color: var(--blue-500);
          }

          &:disabled {
            color: var(--text-gray-300);
            border-color: var(--bg-gray-400);
            cursor: not-allowed;
          }
        }

        &.cancel-btn {
          color: var(--text-gray-400);
          border-color: var(--el-border-color);

          &:hover {
            background: var(--bg-gray-150);
            color: var(--text-gray-700);
            border-color: var(--text-gray-300);
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: var(--text-gray-400);

    .empty-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: var(--el-border-color);
    }

    .empty-text {
      font-size: 14px;
    }
  }
}
</style>
