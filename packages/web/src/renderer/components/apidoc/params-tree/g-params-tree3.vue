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
        <el-button
          class="mr-2"
          :title="t('删除当前项')"
          text
          :icon="Close"
          @click="handleDeleteRow(data)"
        >
        </el-button>
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
          @update:modelValue="v => handleChangeType(v as HttpNodePropertyType, data)"
        >
          <el-option label="String" value="string"></el-option>
          <el-option label="Number" value="number"></el-option>
          <el-option label="Boolean" value="boolean"></el-option>
          <el-option label="File" value="file"></el-option>
        </el-select>
        <el-popover
          v-if="data.type !== 'boolean' && data.type !== 'file'"
          :visible="data._id === currentOpData?._id"
          placement="top-start"
          width="auto"
        >
          <SMock :search-value="data.value" @close="handleCloseMock()" @select="v => handleSelectMockValue(v, data)"></SMock>
          <template #reference>
            <el-input
              :model-value="data.value"
              class="w-25 mr-2"
              :placeholder="getValuePlaceholder(data)"
              @update:modelValue="v => handleChangeValue(v, data)"
              @focus="handleFocusValue(data)"
              @blur="handleBlurValue()"
            >
            </el-input>
          </template>
        </el-popover>
        <el-select
          v-if="data.type === 'boolean'"
          :model-value="data.value"
          :placeholder="t('请选择')"
          class="w-25 flex0"
          :size="config.renderConfig.layout.size"
          @update:modelValue="v => handleChangeBooleanValue(v as string, data)"
        >
          <el-option label="true" value="true"></el-option>
          <el-option label="false" value="false"></el-option>
        </el-select>
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
              @focus="handleFocusValue(data)"
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
import type { ApidocProperty, HttpNodePropertyType, MockItem } from '@src/types';
import { apidocGenerateProperty } from '@/helper/index';
import { useI18n } from 'vue-i18n';
import SMock from '@/components/apidoc/mock/g-mock.vue';
import { config } from '@src/config/config';

const props = defineProps<{ data: ApidocProperty[] }>();
const emits = defineEmits<{ (e: 'change', value: ApidocProperty[]): void }>();
const { t } = useI18n();

const localData: Ref<ApidocProperty[]> = ref([]);
const tree: Ref<any> = ref(null);
const enableDrag = ref(true);
const currentOpData: Ref<ApidocProperty | null> = ref(null);

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
      localData.value.push(apidocGenerateProperty());
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

const handleDeleteRow = (data: ApidocProperty) => {
  const idx = localData.value.findIndex(i => i._id === data._id);
  if (idx > -1) {
    localData.value.splice(idx, 1);
  }
  if (localData.value.length === 0) {
    localData.value.push(apidocGenerateProperty());
  }
  emitChange();
};

const autoAppendIfNeeded = (data: ApidocProperty) => {
  const isLast = localData.value[localData.value.length - 1]?._id === data._id;
  const hasKey = (data.key ?? '').trim() !== '';
  if (isLast && hasKey) {
    localData.value.push(apidocGenerateProperty());
  }
};

const handleChangeKey = (v: string, data: ApidocProperty) => {
  data.key = v;
  autoAppendIfNeeded(data);
  emitChange();
};

const getValuePlaceholder = (data: ApidocProperty) => {
  return data._valuePlaceholder || t('请输入');
};

const handleChangeValue = (v: string, data: ApidocProperty) => {
  data.value = v;
  emitChange();
};

const handleChangeBooleanValue = (v: string, data: ApidocProperty) => {
  data.value = v;
  emitChange();
};

const handleChangeType = (v: HttpNodePropertyType, data: ApidocProperty) => {
  data.type = v;
  if (v === 'boolean') {
    data.value = data.value === 'false' ? 'false' : 'true';
  } else if (v === 'file') {
    data.fileValueType = data.fileValueType ?? 'var';
    data.value = '';
    data._error = '';
  } else {
    data.value = '';
  }
  emitChange();
};

const handleFocusValue = (data: ApidocProperty) => {
  currentOpData.value = data;
};

const handleBlurValue = () => {
  setTimeout(() => (currentOpData.value = null), 150);
};

const handleCloseMock = () => {
  currentOpData.value = null;
};

const handleSelectMockValue = (item: MockItem, data: ApidocProperty) => {
  data.value = item.value;
  emitChange();
};

const handleToggleFileValueType = (data: ApidocProperty) => {
  data.fileValueType = data.fileValueType === 'var' ? 'file' : 'var';
  emitChange();
};

const handleClearFileValue = (data: ApidocProperty) => {
  data.value = '';
  emitChange();
};

const handleSelectFile = (e: Event, data: ApidocProperty) => {
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

const handleChangeRequired = (v: boolean, data: ApidocProperty) => {
  data.required = !!v;
  emitChange();
};

const handleChangeDescription = (v: string, data: ApidocProperty) => {
  data.description = v;
  emitChange();
};

const handleCheckChange = (data: ApidocProperty, select: boolean) => {
  data.select = select;
  emitChange();
};
</script>
<style lang='scss'>
.custom-params {
  width: 100%;
  display: flex;
  align-items: center;
  :deep(.el-input__wrapper) {
    box-shadow: none;
  }
  
}

</style>
