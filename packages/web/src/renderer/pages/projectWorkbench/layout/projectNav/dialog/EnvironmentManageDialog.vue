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
            <button class="side-create-btn" type="button" @click="handleShowCreateEnvironment">
              <Plus :size="14" />
              <span>{{ t('新建环境') }}</span>
            </button>
          </div>
          <div class="env-list">
            <button class="env-item" type="button" @click="handleShowEnvironmentDetail">
              <span class="env-item-name">
                <span>{{ t('开发环境 dev') }}</span>
              </span>
            </button>
            <button class="env-item active" type="button" @click="handleShowEnvironmentDetail">
              <span class="env-item-name">
                <span>{{ t('测试环境 test') }}</span>
              </span>
              <span class="env-item-tag">{{ t('当前使用') }}</span>
            </button>
            <button class="env-item" type="button" @click="handleShowEnvironmentDetail">
              <span class="env-item-name">
                <span>{{ t('生产环境 prod') }}</span>
              </span>
            </button>
          </div>
          <div class="scope-tip">
            <span class="scope-tip-title">{{ t('变量优先级') }}</span>
            <span class="scope-tip-desc">{{ t('请求临时变量 > 当前环境变量 > 全局变量') }}</span>
          </div>
        </aside>
        <section v-if="!showCreateEnvironment" class="env-manage-main">
          <div class="meta-grid">
            <label class="meta-field">
              <span class="meta-label">{{ t('环境名称') }}</span>
              <input type="text" :value="t('测试环境 test')" />
            </label>
            <label class="meta-field">
              <span class="meta-label">{{ t('Base URL') }}</span>
              <input type="text" value="https://api-test.apiflow.dev" />
            </label>
            <label class="meta-field desc">
              <span class="meta-label">{{ t('描述') }}</span>
              <textarea>{{ t('用于联调和回归验证，默认不影响生产数据。') }}</textarea>
            </label>
          </div>
          <div class="table-toolbar">
            <label class="search-box table-search">
              <Search :size="14" />
              <input type="text" :placeholder="t('搜索变量名、值或类型')" />
            </label>
            <button class="table-add-btn" type="button">
              <Plus :size="14" />
              <span>{{ t('新增变量') }}</span>
            </button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="switch-col">{{ t('启用') }}</th>
                  <th>{{ t('变量名称') }}</th>
                  <th>{{ t('本地值（Local）') }}</th>
                  <th>{{ t('共享值（Shared）') }}</th>
                  <th>{{ t('类型') }}</th>
                  <th class="operation-col">{{ t('操作') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="switch-col">
                    <input type="checkbox" checked />
                  </td>
                  <td><input type="text" value="base_url" /></td>
                  <td><input type="text" value="https://api-test.apiflow.dev" /></td>
                  <td><input type="text" value="https://api.apiflow.dev" /></td>
                  <td>
                    <select>
                      <option selected>text</option>
                      <option>secret</option>
                    </select>
                  </td>
                  <td class="operation-col">
                    <button class="icon-btn" type="button">
                      <Trash2 :size="14" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td class="switch-col">
                    <input type="checkbox" checked />
                  </td>
                  <td><input type="text" value="token" /></td>
                  <td>
                    <div class="secret-cell">
                      <span class="secret-mask">••••••••••••</span>
                      <button class="icon-btn" type="button">
                        <Eye :size="14" />
                      </button>
                    </div>
                  </td>
                  <td><input type="text" :placeholder="t('无环境')" /></td>
                  <td>
                    <select>
                      <option>text</option>
                      <option selected>secret</option>
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
        <section v-else class="env-manage-main create-main">
          <div class="create-head">
            <span class="create-title">{{ t('新建环境') }}</span>
            <span class="create-subtitle">{{ t('修改数据后可以保存') }}</span>
          </div>
          <div class="meta-grid">
            <label class="meta-field">
              <span class="meta-label">{{ t('环境名称') }}</span>
              <input type="text" :placeholder="t('请输入名称')" />
            </label>
            <label class="meta-field">
              <span class="meta-label">{{ t('Base URL') }}</span>
              <input type="text" :placeholder="t('请输入 API Base URL')" />
            </label>
            <label class="meta-field desc">
              <span class="meta-label">{{ t('描述') }}</span>
              <textarea :placeholder="t('请输入备注')"></textarea>
            </label>
          </div>
          <div class="table-toolbar">
            <label class="search-box table-search">
              <Search :size="14" />
              <input type="text" :placeholder="t('搜索变量名、值或类型')" />
            </label>
            <button class="table-add-btn" type="button">
              <Plus :size="14" />
              <span>{{ t('新增变量') }}</span>
            </button>
          </div>
          <div class="create-empty">
            <span class="create-empty-title">{{ t('新增变量') }}</span>
            <span class="create-empty-desc">{{ t('修改数据后可以保存') }}</span>
          </div>
        </section>
      </div>
      <div class="env-manage-footer">
        <span class="footer-dirty">{{ t('当前环境有未保存改动') }}</span>
        <div class="footer-actions">
          <button type="button" @click="handleClose">{{ t('取消') }}</button>
          <button type="button">{{ t('应用') }}</button>
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
  Search,
  Eye,
  Trash2,
  ShieldAlert,
  X
} from 'lucide-vue-next'
import { ref } from 'vue'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { t } = useI18n()
const showCreateEnvironment = ref(false)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleShowCreateEnvironment = () => {
  showCreateEnvironment.value = true
}

const handleShowEnvironmentDetail = () => {
  showCreateEnvironment.value = false
}

const handleUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value)
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
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .side-title {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
  }
  .side-create-btn {
    height: 28px;
    border: 1px solid #d9dee8;
    border-radius: 6px;
    background: #ffffff;
    color: #4b5563;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      color: #111827;
      border-color: #cfd6e3;
      background: #f8fafc;
    }
  }
  .search-box {
    height: 34px;
    border: 1px solid #d9dee8;
    border-radius: 6px;
    background: #ffffff;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    input {
      flex: 1;
      width: 100%;
      min-width: 0;
      border: none;
      background: transparent;
      color: #111827;
      outline: none;
    }
  }
  .env-list {
    display: grid;
    gap: 6px;
    align-content: start;
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
    gap: 0;
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
  .scope-tip {
    border: 1px solid #e1e8f4;
    border-radius: 6px;
    background: #f9fbff;
    padding: 10px;
    display: grid;
    gap: 4px;
  }
  .scope-tip-title {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
  }
  .scope-tip-desc {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
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
    justify-content: space-between;
    gap: 8px;
  }
  .table-search {
    max-width: 360px;
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
  .create-main {
    grid-template-rows: auto auto auto 1fr;
  }
  .create-head {
    display: grid;
    gap: 4px;
  }
  .create-title {
    font-size: 14px;
    color: #111827;
    font-weight: 600;
  }
  .create-subtitle {
    font-size: 12px;
    color: #6b7280;
  }
  .create-empty {
    border: 1px dashed #d9dee8;
    border-radius: 6px;
    background: #fafbfc;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 6px;
    min-height: 180px;
  }
  .create-empty-title {
    font-size: 13px;
    color: #111827;
    font-weight: 600;
  }
  .create-empty-desc {
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
  }
  .secret-mask {
    color: #6b7280;
    letter-spacing: 2px;
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
    .table-search {
      max-width: 100%;
      flex: 1;
    }
  }
}
</style>
