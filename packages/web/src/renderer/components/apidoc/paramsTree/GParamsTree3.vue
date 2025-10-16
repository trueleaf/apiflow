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
          <el-input
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
          :disabled="!props.enableFile && data.type === 'file'"
          @update:modelValue="v => handleChangeType(v as 'string' | 'file', data)"
        >
          <el-option label="String" value="string"></el-option>
          <el-option label="File" value="file"></el-option>
        </el-select>
        <el-popover
          v-if="data.type === 'string'"
          :visible="data._id === currentOpData?._id && (data.value || '').includes('@')"
          placement="top-start"
          width="auto"
        >
          <SMock :search-value="data.value.split('@').pop() || ''" @close="handleCloseMock()" @select="v => handleSelectMockValue(v, data)"></SMock>
          <template #reference>
            <el-input
              :model-value="data.value"
              class="w-25 mr-2"
              :placeholder="t('参数值、@代表mock数据、{{ 变量 }}')"
              @update:modelValue="v => handleChangeValue(v, data)"
              @blur="handleBlurValue()"
            >
            </el-input>
          </template>
        </el-popover>
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
          :placeholder="t('参数描述与备注')"
          @focus="handleDisableDrag()"
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
}>();
const emits = defineEmits<{ (e: 'change', value: ApidocProperty<'string' | 'file'>[]): void }>();
const { t } = useI18n();

const localData: Ref<ApidocProperty<'string' | 'file'>[]> = ref([]);
const enableDrag = ref(true);
const currentOpData: Ref<ApidocProperty<'string' | 'file'> | null> = ref(null);
const checkedKeys = computed(() => localData.value.filter(v => v.select).map(v => v._id));
const emitChange = () => {
  emits('change', localData.value);
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

const handleCloseMock = () => {
  currentOpData.value = null;
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
