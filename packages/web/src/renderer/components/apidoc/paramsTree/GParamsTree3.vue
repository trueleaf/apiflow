<template>
  <el-tree
    ref="tree"
    :data="localData"
    :indent="50"
    node-key="_id"
    :expand-on-click-node="false"
    :draggable="enableDrag"
    :allow-drop="handleAllowDrop"
    :show-checkbox="true"
    :check-on-click-leaf="false"
    :default-checked-keys="checkedKeys"
    @node-drop="handleNodeDrop"
    @check-change="handleCheckChange"
  >
    <template #default="{ data }">
      <div class="custom-params">
        <el-icon
          class="delete-icon"
          :class="{ disabled: localData.length <= 1 }"
          :size="14"
          :title="localData.length <= 1 ? t('至少保留一条数据') : t('删除')"
          @click="() => handleDeleteRow(data)"
        >
          <Close />
        </el-icon>
        <div class="w-15 flex0 mr-2 d-flex a-center">
          <el-autocomplete
            v-if="props.mindKeyParams && props.mindKeyParams.length > 0"
            :model-value="data.key"
            :debounce="0"
            :placeholder="t('输入参数名称自动换行')"
            :fetch-suggestions="querySearchKey"
            popper-class="params-tree-autocomplete"
            @select="(item: any) => handleSelectKey(item, data)"
            @update:modelValue="(v: string | number) => handleChangeKey(String(v), data)"
            @focus="handleDisableDrag()"
            @blur="handleEnableDrag()"
          >
            <template #default="{ item }">
              <div class="autocomplete-item">
                <div class="value" v-html="highlightText(item.key, currentKeyQuery)"></div>
                <div class="description" v-html="highlightText(item.description || '', currentKeyQuery)"></div>
              </div>
            </template>
          </el-autocomplete>
          <el-input
            v-else
            :model-value="data.key"
            :placeholder="t('输入参数名称自动换行')"
            @update:modelValue="v => handleChangeKey(v, data)"
            @focus="handleDisableDrag()"
            @blur="handleEnableDrag()"
          >
          </el-input>
        </div>
        <el-select
          :model-value="data.type"
          :placeholder="t('类型')"
          class="w-15 flex0 mr-2"
          :size="config.renderConfig.layout.size"
          :disabled="!props.enableFile"
          @update:modelValue="v => handleChangeType(v as 'string' | 'file', data)"
        >
          <el-option label="String" value="string"></el-option>
          <el-option v-if="props.enableFile" label="File" value="file"></el-option>
        </el-select>
        <!-- 参数值 string -->
        <el-popover
          v-if="data.type === 'string'"
          :visible="data._id === currentOpData?._id && (data.value || '').includes('@')"
          placement="top-start"
          width="auto"
        >
          <SMock :search-value="data.value.split('@').pop() || ''" @close="handleCloseMock()" @select="v => handleSelectMockValue(v, data)"></SMock>
          <template #reference>
            <div class="value-input-wrap w-25 mr-2">
              <input
                v-show="focusedValueId !== data._id"
                :value="data.value"
                type="text"
                class="value-text-input"
                :placeholder="t('参数值、@代表mock数据、{{ 变量 }}')"
                @input="e => handleChangeValue((e.target as HTMLInputElement).value, data)"
                @focus="handleFocusValue(data)"
              />
              <el-input
                v-if="focusedValueId === data._id"
                ref="valueTextarea"
                :model-value="data.value"
                class="value-textarea"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 10 }"
                resize="none"
                :placeholder="t('参数值、@代表mock数据、{{ 变量 }}')"
                @update:modelValue="v => handleChangeValue(v, data)"
                @blur="handleBlurValueAndEnableDrag()"
              />
            </div>
          </template>
        </el-popover>
        <!-- 参数值 File -->
        <div
          v-if="data.type === 'file'"
          class="w-25 mr-2"
          :class="{ active: data.value, 'no-border': (data.fileValueType === 'var' || data.fileValueType === 'file') }"
          @mouseenter="handleDisableDrag()"
          @mouseleave="handleEnableDrag()"
        >
          <div class="file-input-wrap">
            <div v-if="data.fileValueType !== 'file' && data.fileValueType !== 'var'" class="mode-list">
              <span class="var-mode" @click="() => data.fileValueType = 'var'">{{ t('变量模式') }}</span>
              <span class="px-3"></span>
              <span class="file-mode" @click="() => data.fileValueType = 'file'">{{ t('文件模式') }}</span>
            </div>
            <el-input
              v-if="data.fileValueType === 'var'"
              :model-value="data.value"
              class="w-100"
              :placeholder="t('变量模式') + ' eg: ' + t('{0} fileValue {1}', ['{{', '}}'])"
              @update:modelValue="v => handleChangeValue(v, data)"
              @blur="handleBlurValue()"
            >
            </el-input>
            <div v-if="data.fileValueType === 'file'" class="file-mode-wrap">
              <label v-show="!data.value" :for="data._id" class="label">{{ t('选择文件') }}</label>
              <span class="text-wrap" :title="data.value">{{ data.value }}</span>
              <el-icon v-if="data.value" class="close" :size="16" @click="handleClearFileValue(data)">
                <close />
              </el-icon>
            </div>
            <div
              v-if="data.fileValueType === 'file' || data.fileValueType === 'var'"
              :title="t('切换变量选择模式，支持变量或者直接选择文件')"
              class="toggle-mode"
              @click="handleToggleFileValueType(data)"
            >
              <el-icon><Switch /></el-icon>
            </div>
            <input
              :id="data._id"
              ref="fileInput"
              class="d-none"
              type="file"
              @change="e => handleSelectFile(e, data)"
            >
            </input>
          </div>
          <div v-if="data._error" class="file-error">{{ data._error }}</div>
        </div>
        <el-checkbox
          :model-value="data.required"
          :label="t('必有')"
          class="pr-2"
          @update:modelValue="v => handleChangeRequired(v as unknown as boolean, data)"
        >
        </el-checkbox>
        <el-input
          :model-value="data.description"
          class="w-40"
          :type="expandedInputs[data._id]?.description ? 'textarea' : 'text'"
          :autosize="expandedInputs[data._id]?.description ? { minRows: 2, maxRows: 6 } : undefined"
          :placeholder="t('参数描述与备注')"
          @focus="handleFocusDescription(data)"
          @blur="handleEnableDrag()"
          @update:modelValue="v => handleChangeDescription(v, data)"
        >
        </el-input>
      </div>
    </template>
  </el-tree>
</template>
<script lang="ts" setup>
import { ref, Ref, watch, computed } from 'vue';
import { Close, Switch } from '@element-plus/icons-vue';
import type Node from 'element-plus/es/components/tree/src/model/node';
import type { ApidocProperty } from '@src/types';
import { apidocGenerateProperty } from '@/helper/index';
import { useI18n } from 'vue-i18n';
import SMock from '@/components/apidoc/mock/GMock.vue';
import { config } from '@src/config/config';

const props = defineProps<{ 
  data: ApidocProperty<'string' | 'file'>[];
  enableFile?: boolean;
  mindKeyParams?: ApidocProperty[];
}>();
const emits = defineEmits<{ (e: 'change', value: ApidocProperty<'string' | 'file'>[]): void }>();
const { t } = useI18n();

const localData: Ref<ApidocProperty<'string' | 'file'>[]> = ref([]);
const enableDrag = ref(true);
const currentOpData: Ref<ApidocProperty<'string' | 'file'> | null> = ref(null);
const expandedInputs = ref<Record<string, { value: boolean, description: boolean }>>({});
const currentKeyQuery = ref('');
const focusedValueId = ref<string>('');
const valueTextarea = ref();
const checkedKeys = computed(() => localData.value.filter(v => v.select).map(v => v._id));
const emitChange = () => {
  emits('change', localData.value);
};
// 高亮文本工具函数
const highlightText = (text: string, query: string): string => {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

watch(
  () => props.data,
  v => {
    if (!v) {
      return;
    }
    localData.value = v.map(i => ({ ...i }));
    if (localData.value.length === 0) {
      localData.value.push(apidocGenerateProperty<'string'>());
    }
  },
  { deep: true, immediate: true },
);

const handleDisableDrag = () => {
  enableDrag.value = false;
};
const handleEnableDrag = () => {
  enableDrag.value = true;
};

const handleAllowDrop = (_: Node, __drop: Node, type: 'inner' | 'prev' | 'next') => {
  return type !== 'inner';
};

const handleNodeDrop = (dragNode: Node, dropNode: Node, type: 'inner' | 'prev' | 'next') => {
  if (type === 'inner') {
    return;
  }
  const fromId = dragNode.data._id as string;
  const toId = dropNode.data._id as string;
  const fromIndex = localData.value.findIndex(i => i._id === fromId);
  const toIndex = localData.value.findIndex(i => i._id === toId);
  if (fromIndex < 0 || toIndex < 0) {
    return;
  }
  const item = localData.value.splice(fromIndex, 1)[0];
  const insertIndex = type === 'prev' ? toIndex : toIndex + 1;
  localData.value.splice(insertIndex, 0, item);
  emitChange();
};

const handleDeleteRow = (data: ApidocProperty<'string' | 'file'>) => {
  // 如果只有一条数据，禁止删除
  if (localData.value.length <= 1) {
    return;
  }
  const idx = localData.value.findIndex(i => i._id === data._id);
  if (idx > -1) {
    localData.value.splice(idx, 1);
  }
  if (localData.value.length === 0) {
    localData.value.push(apidocGenerateProperty<'string'>());
  }
  emitChange();
};

const autoAppendIfNeeded = (data: ApidocProperty<'string' | 'file'>) => {
  const isLast = localData.value[localData.value.length - 1]?._id === data._id;
  const hasKey = (data.key ?? '').trim() !== '';
  if (isLast && hasKey) {
    localData.value.push(apidocGenerateProperty<'string'>());
  }
};

const handleChangeKey = (v: string, data: ApidocProperty<'string' | 'file'>) => {
  data.key = v;
  autoAppendIfNeeded(data);
  emitChange();
};

const handleChangeValue = (v: string, data: ApidocProperty<'string' | 'file'>) => {
  data.value = v;
  // 检测是否包含@符号，如果包含则显示mock弹窗
  if (v.includes('@')) {
    currentOpData.value = data;
  } else {
    currentOpData.value = null;
  }
  emitChange();
};

const handleChangeType = (v: 'string' | 'file', data: ApidocProperty<'string' | 'file'>) => {
  data.type = v;
  if (v === 'file') {
    data.fileValueType = data.fileValueType ?? 'var';
    data.value = '';
    data._error = '';
  } else {
    data.value = '';
    // 清除文件相关属性
    delete data.fileValueType;
    delete data._error;
  }
  emitChange();
};

const handleBlurValue = () => {
  setTimeout(() => (currentOpData.value = null), 150);
};
// 组合函数：同时处理 Mock 弹窗关闭、恢复拖拽和重置为 text 类型
const handleBlurValueAndEnableDrag = () => {
  handleBlurValue();
  handleEnableDrag();
  focusedValueId.value = '';
};

const handleCloseMock = () => {
  currentOpData.value = null;
};
// 处理参数值聚焦时的展开逻辑
const handleFocusValue = (data: ApidocProperty<'string' | 'file'>) => {
  handleDisableDrag();
  focusedValueId.value = data._id;
  setTimeout(() => {
    valueTextarea.value?.focus();
  });
};
// 处理描述聚焦时的展开逻辑
const handleFocusDescription = (data: ApidocProperty<'string' | 'file'>) => {
  handleDisableDrag();
  if (!expandedInputs.value[data._id]) {
    expandedInputs.value[data._id] = { value: false, description: false };
  }
  const shouldExpand = (data.description?.length || 0) > 50 || (data.description?.includes('\n') || false);
  expandedInputs.value[data._id].description = shouldExpand;
};

const handleSelectMockValue = (item: any, data: ApidocProperty<'string' | 'file'>) => {
  data.value = item.value;
  // 选中mock数据后自动关闭弹窗
  currentOpData.value = null;
  emitChange();
};

const handleToggleFileValueType = (data: ApidocProperty<'string' | 'file'>) => {
  data.fileValueType = data.fileValueType === 'var' ? 'file' : 'var';
  emitChange();
};

const handleClearFileValue = (data: ApidocProperty<'string' | 'file'>) => {
  data.value = '';
  emitChange();
};

const handleSelectFile = (e: Event, data: ApidocProperty<'string' | 'file'>) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) {
    data.value = '';
    emitChange();
    return;
  }
  const f = files[0];
  const path = (f as any).path || f.name;
  if (!path) {
    data._error = t('未能读取文件');
    emitChange();
    return;
  }
  data._error = '';
  data.value = path;
  emitChange();
};

const handleChangeRequired = (v: boolean, data: ApidocProperty<'string' | 'file'>) => {
  data.required = !!v;
  emitChange();
};

const handleChangeDescription = (v: string, data: ApidocProperty<'string' | 'file'>) => {
  data.description = v;
  emitChange();
};

const handleCheckChange = (data: ApidocProperty<'string' | 'file'>, select: boolean) => {
  data.select = select;
  emitChange();
};
// 参数名称联想查询函数
const querySearchKey = (queryString: string, cb: (results: ApidocProperty[]) => void) => {
  if (!props.mindKeyParams || props.mindKeyParams.length === 0) {
    cb([]);
    return;
  }
  const query = (queryString || '').trim();
  if (!query) {
    currentKeyQuery.value = '';
    cb([]);
    return;
  }
  currentKeyQuery.value = query;
  const lowerQuery = query.toLowerCase();
  const results = props.mindKeyParams.filter(item => item.key.toLowerCase().includes(lowerQuery) || (item.description || '').toLowerCase().includes(lowerQuery));
  cb(results.slice(0, 10));
};
// 处理参数名称选中事件
const handleSelectKey = (item: ApidocProperty, data: ApidocProperty<'string' | 'file'>) => {
  data.key = item.key;
  autoAppendIfNeeded(data);
  emitChange();
};
</script>
<style lang='scss' scoped>
.custom-params {
  width: 100%;
  display: flex;
  align-items: center;
  
  :deep(.el-input__wrapper) {
    box-shadow: none;
    font-size: 12px;
    border-bottom: 1px solid var(--gray-400);
    border-radius: 0;
    .el-input__inner {
      height: 28px;
      line-height: 28px;
    }
  }
  :deep(.el-select__wrapper) {
    height: 28px;
    min-height: 28px;
    line-height: 28px;
  }
  :deep(.el-autocomplete) {
    width: 100%;
  }

  .delete-icon {
    height: 30px;
    display: flex;
    align-items: center;
    margin-right: 10px;
    cursor: pointer;
    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
  .value-input-wrap {
    position: relative;
    height: 29px;
    .value-text-input {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      border: none;
      border-bottom: 1px solid var(--gray-400);
      padding: 0 10px;
      font-size: 12px;
      color: var(--el-input-text-color, var(--el-text-color-regular));
      &::placeholder {
        color: var(--gray-400);
      }
    }
    .value-textarea {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      width: 100%;
      :deep(.el-textarea__inner) {
        font-size: 12px;
        color: var(--el-input-text-color, var(--el-text-color-regular));
        &::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        &::-webkit-scrollbar-thumb {
          background: var(--gray-500);
        }
        &::placeholder {
          color: var(--gray-400);
        }
      }
    }
  }
  .file-input-wrap {
    box-sizing: content-box;
    cursor: default;
    border: 1px dashed var(--gray-400);
    display: flex;
    align-items: center;
    height: 28px;
    position: relative;
    font-size: 13px;
    :deep(.el-input__wrapper) {
      box-shadow: none;
      border-bottom: none;
      height: 28px;
    }
    &.active {
      background: none;
      border: 1px solid var(--gray-300);
      cursor: auto;
    }
    &.no-border {
      border: none;
    }
    .mode-list {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

    }
    .var-mode,.file-mode {
      cursor: pointer;
      &:hover {
        color: var(--theme-color);
      }
    }
    .file-mode-wrap {
      .label {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--gray-300);
        cursor: pointer;
      }
      .close {
        position: absolute;
        right: 3px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 16px;
        cursor: pointer;
        &:hover {
          color: var(--red);
        }
      }
    }
    .toggle-mode {
      flex: 0 0 20px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        cursor: pointer;
        color: var(--theme-color);
      }
    }
  }
}

</style>
<style lang='scss'>
.params-tree-autocomplete {
  width: 500px;
  .autocomplete-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .value {
      flex: 0 0 150px;
      font-size: 13px;
      color: var(--color-text-1);
      font-weight: 500;
    }
    .description {
      // flex: 1;
      font-size: 12px;
      color: var(--color-text-3);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .highlight {
    color: var(--theme-color);
    font-weight: 600;
  }
}
</style>
