<template>
  <div class="cl-params-tree">
    <!-- 多行编辑模式 -->
    <div v-if="props.editMode === 'multiline'" class="multiline-editor">
      <div class="textarea-wrapper">
        <el-input
          v-model="multilineText"
          type="textarea"
          :rows="15"
          :placeholder="tipPlaceholder"
          class="multiline-textarea"
          data-testid="params-tree-multiline-textarea"
          @input="handleMultilineTextChange"
        />
        <div class="textarea-actions">
          <el-icon
            class="ai-parse-btn"
            :class="{ disabled: (isAiConfigValid && !multilineText.trim()) || aiParsing }"
            :title="isAiConfigValid ? t('AI智能解析') : t('点击配置AI')"
            data-testid="params-tree-ai-parse-btn"
            @click="handleAiClick"
          >
            <MagicStick v-if="!aiParsing" />
            <el-icon v-else class="is-loading">
              <Loading />
            </el-icon>
          </el-icon>
          <el-button 
            size="small"
            data-testid="params-tree-cancel-btn"
            @click="handleCancelMultiline"
          >
            {{ t('返回') }}
          </el-button>
          <el-button 
            type="primary" 
            size="small"
            :disabled="!multilineText.trim()"
            data-testid="params-tree-apply-btn"
            @click="handleApplyMultiline"
          >
            {{ t('应用') }} ({{ parsedCount }}{{ t('条') }})
          </el-button>
        </div>
      </div>
      <div class="multiline-footer">
        <div class="format-tip">
          {{ t('格式说明') }}: *key=value //{{ t('描述') }}  (*{{ t('表示必填') }}，//{{ t('后为描述') }})
        </div>
        <div v-if="parseError" class="parse-error">
          {{ parseError }}
        </div>
      </div>
    </div>
    
    <!-- 表格模式 -->
    <el-tree
      v-if="props.editMode !== 'multiline'" 
       ref="treeRef" 
       node-key="_id" 
       :data="localData" 
       :indent="50" 
       :expand-on-click-node="false" 
       :draggable="enableDrag" 
       :allow-drop="handleAllowDrop" 
       :show-checkbox="showCheckbox" 
       :check-on-click-leaf="false" 
       :default-checked-keys="defaultCheckedKeys" 
       @node-drop="handleNodeDrop" 
       @check-change="handleCheckChange"
     >
       <template #default="{ data }">
         <div class="custom-params">
           <el-icon 
             class="delete-icon" 
             :class="{ disabled: localData.length <= 1 || data._disableDelete || isLastEmptyItem(data) }" 
             :size="14" 
             :title="getDeleteTooltip(data)" 
             data-testid="params-tree-delete-btn"
             @click="() => handleDeleteRow(data)"
           >
             <Close />
           </el-icon>
           <!-- 参数key -->
           <div class="w-15 flex0 mr-2 d-flex a-center" @mouseenter="handleDisableDrag()" @mouseleave="handleEnableDrag()">
             <el-autocomplete 
               v-if="props.mindKeyParams && props.mindKeyParams.length > 0" 
               popper-class="params-tree-autocomplete" 
               :model-value="data.key" 
               :debounce="0" 
               :placeholder="t('输入参数名称自动换行')" 
               :fetch-suggestions="querySearchKey" 
               :disabled="data._disableKey || props.disableKeyEdit" 
               :title="data._disableKeyTip || (props.disableKeyEdit ? t('Path参数名由URL自动解析，不可修改') : '')" 
               data-testid="params-tree-key-autocomplete"
               @select="(item: any) => handleSelectKey(item, data)" 
               @update:modelValue="(v: string | number) => handleChangeKey(String(v), data)" 
               @focus="handleFocusKey()" 
               @blur="handleEnableDrag()" 
               @keydown="(e: KeyboardEvent) => { handlePreventDefaultKeys(e); handleKeyDown(e, data); }" 
               @paste="(event: ClipboardEvent) => handlePasteKey(event, data)"
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
               :disabled="data._disableKey || props.disableKeyEdit" 
               :title="data._disableKeyTip || (props.disableKeyEdit ? t('Path参数名由URL自动解析，不可修改') : '')" 
               data-testid="params-tree-key-input"
               @update:modelValue="v => handleChangeKey(v, data)" 
               @focus="handleDisableDrag()" 
               @blur="handleEnableDrag()" 
               @keydown="handlePreventDefaultKeys" 
               @paste="(event: ClipboardEvent) => handlePasteKey(event, data)"
             >
             </el-input>
           </div>
           <!-- 参数类型 -->
           <div class="w-15 flex0 mr-2" @mouseenter="handleDisableDrag()" @mouseleave="handleEnableDrag()">
             <el-select 
               class="w-100" 
               :model-value="data.type" 
               :placeholder="t('类型')" 
               :size="config.renderConfig.layout.size" 
               :disabled="!props.enableFile"
               data-testid="params-tree-type-select"
               @update:modelValue="v => handleChangeType(v as 'string' | 'file', data)"
               @keydown="handlePreventDefaultKeys"
             >
               <el-option label="String" value="string"></el-option>
               <el-option v-if="props.enableFile" label="File" value="file"></el-option>
             </el-select>
           </div>
           <!-- 参数值 string (临时文件模式) -->
           <div 
             v-if="data.type === 'string' && data._isTempFile" 
             class="w-35 mr-2 temp-file-display"
             @mouseenter="handleDisableDrag()"
             @mouseleave="handleEnableDrag()"
           >
             <div class="temp-file-info">
               <el-icon class="temp-file-icon"><FileIcon /></el-icon>
               <span class="temp-file-size">{{ formatUnit(data._originalSize || 0, 'bytes') }}</span>
               <el-icon class="temp-file-clear" :title="t('清除临时文件')" @click="handleClearTempFile(data)">
                 <Close />
               </el-icon>
             </div>
           </div>
           <!-- 参数值 string (普通模式) -->
           <el-popover 
             v-if="data.type === 'string' && !data._isTempFile" 
             placement="top-start" 
             width="auto" 
             :visible="data._id === currentOpData?._id && (data.value || '').includes('@')"
           >
             <SMock 
               @close="handleCloseMock()" 
               @select="v => handleSelectMockValue(v, data)"
               @interaction="handleMockInteraction"
             ></SMock>
             <template #reference>
               <div 
                 class="value-input-wrap w-35 mr-2" 
                 :class="{ 'is-multiline': multilineInputs[data._id], 'is-pinned': focusedInputId === data._id && multilineInputs[data._id] }" 
                 @mouseenter="handleDisableDrag()" 
                 @mouseleave="handleEnableDrag()"
               >
                 <ClRichInput 
                   :ref="(el) => setValueRichInputRef(el as InstanceType<typeof ClRichInput> | null, data._id)"
                   class="value-rich-input" 
                   :model-value="data.value" 
                   :placeholder="data._valuePlaceholder || t('输入@唤起变量弹窗')" 
                   :min-height="28" 
                   :max-height="280" 
                   :trim-on-paste="true" 
                   :expand-on-focus="true" 
                   :disabled="data._disableValue" 
                   disable-history 
                   data-testid="params-tree-value-input"
                   @update:modelValue="v => handleChangeValue(v, data)" 
                   @focus="handleFocusValue(data)" 
                   @blur="handleBlurValueAndEnableDrag()" 
                   @multiline-change="(isMultiline) => handleMultilineChange(data._id, isMultiline)" 
                   @paste="handleRichInputPaste()"
                   @before-paste="(text, shouldPrevent) => handleBeforePasteValue(text, shouldPrevent, data)"
                 >
                   <template #variable="{ label }">
                     <div v-if="getVariableValue(label)" class="variable-popover">
                       <div class="variable-name">变量名称：{{ label }}</div>
                       <div class="variable-value">变量值：{{ getVariableValue(label) }}</div>
                     </div>
                     <div v-else class="variable-popover">
                       <div class="variable-warning">{{ t('变量未定义', { name: label }) }}</div>
                       <el-button size="small" type="primary" link @click="handleGoToVariableManage">
                         {{ t('前往变量管理') }}
                       </el-button>
                     </div>
                   </template>
                 </ClRichInput>
               </div>
             </template>
           </el-popover>
           <!-- 参数值 File -->
           <div
             v-if="data.type === 'file'"
             class="w-35 mr-2 file-value-wrapper"
             :class="{ active: data.value, 'no-border': (data.fileValueType === 'var' || data.fileValueType === 'file') }"
             @mouseenter="handleDisableDrag()"
             @mouseleave="handleEnableDrag()"
           >
             <div class="file-input-wrap">
               <div v-if="data.fileValueType !== 'file' && data.fileValueType !== 'var'" class="mode-list">
                 <span class="var-mode" data-testid="params-tree-var-mode-btn" @click="() => data.fileValueType = 'var'">{{ t('变量模式') }}</span>
                 <span class="px-3"></span>
                 <span class="file-mode" data-testid="params-tree-file-mode-btn" @click="() => data.fileValueType = 'file'">{{ t('文件模式') }}</span>
               </div>
               <!-- 变量模式临时文件显示 -->
               <div v-if="data.fileValueType === 'var' && data._isTempFile" class="temp-file-display var-temp-file">
                 <div class="temp-file-info">
                   <el-icon class="temp-file-icon"><FileIcon /></el-icon>
                   <span class="temp-file-size">{{ formatUnit(data._originalSize || 0, 'bytes') }}</span>
                   <el-icon class="temp-file-clear" :title="t('清除临时文件')" @click="handleClearTempFile(data)">
                     <Close />
                   </el-icon>
                 </div>
               </div>
               <!-- 变量模式输入框 -->
               <el-input 
                 v-if="data.fileValueType === 'var' && !data._isTempFile" 
                 class="w-100" 
                 :model-value="data.value" 
                 :placeholder="data._valuePlaceholder || (t('变量模式') + ' eg: ' + t('{0} fileValue {1}', ['{{', '}}']))" 
                 :disabled="data._disableValue" 
                 data-testid="params-tree-file-var-input"
                 @update:modelValue="v => handleChangeValue(v, data)" 
                 @blur="handleBlurValue()" 
                 @paste="(event: ClipboardEvent) => handlePasteValueInput(event, data)"
               >
               </el-input>
               <div v-if="data.fileValueType === 'file'" class="file-mode-wrap">
                 <label v-show="!data.value" class="label" :for="data._id" data-testid="params-tree-file-select-label">{{ t('选择文件') }}</label>
                 <span class="text-wrap" :title="data.value">{{ data.value }}</span>
                 <el-icon v-if="data.value" class="close" :size="16" data-testid="params-tree-file-clear-btn" @click="handleClearFileValue(data)">
                   <close />
                 </el-icon>
               </div>
               <div 
                 v-if="data.fileValueType === 'file' || data.fileValueType === 'var'" 
                 class="toggle-mode" 
                 :title="t('切换变量选择模式，支持变量或者直接选择文件')" 
                 data-testid="params-tree-file-toggle-btn"
                 @click="handleToggleFileValueType(data)"
               >
                 <el-icon>
                   <Switch />
                 </el-icon>
               </div>
               <input 
                 :id="data._id" 
                 ref="fileInput" 
                 class="d-none" 
                 type="file" 
                 data-testid="params-tree-file-input"
                 @change="e => handleSelectFile(e, data)"
               >
               </input>
             </div>
             <div v-if="data._error" class="file-error">{{ data._error }}</div>
           </div>
           <!-- 参数是否必有 -->
           <el-checkbox 
             class="pr-2" 
             :model-value="data.required" 
             :label="t('必有')" 
             :disabled="data.disabled" 
             data-testid="params-tree-required-checkbox"
             @update:modelValue="v => handleChangeRequired(v as unknown as boolean, data)"
           >
           </el-checkbox>
           <!-- 参数备注 -->
           <div class="w-30" @mouseenter="handleDisableDrag()" @mouseleave="handleEnableDrag()">
             <el-input 
               class="w-100" 
               :model-value="data.description" 
               :type="expandedInputs[data._id]?.description ? 'textarea' : 'text'" 
               :autosize="expandedInputs[data._id]?.description ? { minRows: 2, maxRows: 6 } : undefined" 
               :placeholder="t('参数描述与备注')" 
               :disabled="data._disableDescription" 
               data-testid="params-tree-description-input"
               @focus="handleFocusDescription(data)" 
               @blur="handleEnableDrag()" 
               @update:modelValue="v => handleChangeDescription(v, data)" 
               @keydown="handlePreventDefaultKeys" 
               @paste="(event: ClipboardEvent) => handlePasteDescription(event, data)"
             >
             </el-input>
           </div>
         </div>
       </template>
     </el-tree>
   </div>
</template>
<script lang="ts" setup>
import { ref, Ref, watch, nextTick, computed } from 'vue';
import { Close, Switch, MagicStick, Loading } from '@element-plus/icons-vue';
import { FileText as FileIcon } from 'lucide-vue-next';
import type Node from 'element-plus/es/components/tree/src/model/node';
import type { ApidocProperty } from '@src/types';
import { generateEmptyProperty, message, formatUnit } from '@/helper';
import { useI18n } from 'vue-i18n';
import SMock from '@/components/apidoc/mock/ClMock.vue';
import { config } from '@src/config/config';
import ClRichInput from '@/components/ui/cleanDesign/richInput/ClRichInput.vue';
import type { ClParamsTreeProps, ClParamsTreeEmits } from '@src/types/components/components';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';
import { useLLMClientStore } from '@/store/ai/llmClientStore';
import type { OpenAiRequestBody } from '@src/types/ai/agent.type';
import { useRouter } from 'vue-router';
import { appState } from '@/cache/appState/appStateCache';
import { useVariable } from '@/store/projectWorkbench/variablesStore';
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore';
import { isEqual } from 'lodash-es';
/*
|--------------------------------------------------------------------------
| Props 和 Emits 定义
|--------------------------------------------------------------------------
*/
const props = withDefaults(defineProps<ClParamsTreeProps>(), {
  showCheckbox: true,
  editMode: 'table',
  disableKeyEdit: false,
});
const emits = defineEmits<ClParamsTreeEmits>();
const { t } = useI18n();
const router = useRouter();
const llmClientStore = useLLMClientStore();
const variableStore = useVariable();
const projectNavStore = useProjectNav();
const projectId = router.currentRoute.value.query.id as string;

const tipPlaceholder = `username=admin //Username
*password=123456 //Password
age=18 //Age`;

/*
|--------------------------------------------------------------------------
| 响应式数据
|--------------------------------------------------------------------------
*/
const treeRef = ref();
const valueRichInputRefs = ref<Map<string, InstanceType<typeof ClRichInput>>>(new Map());
const localData: Ref<ApidocProperty<'string' | 'file'>[]> = ref([]);
const enableDrag = ref(true);
const currentOpData: Ref<ApidocProperty<'string' | 'file'> | null> = ref(null);
const expandedInputs = ref<Record<string, { value: boolean, description: boolean }>>({});
const currentKeyQuery = ref('');
const currentSuggestions = ref<ApidocProperty[]>([]);
const highlightedIndex = ref(-1);
const hasUserInput = ref(false);
const defaultCheckedKeys = ref<string[]>([]);
const multilineInputs = ref<Record<string, boolean>>({});
const focusedInputId = ref<string | null>(null);
const isMockPanelFocused = ref(false);
const isPasting = ref(false);
const multilineText = ref('');
const parseError = ref('');
const parsedCount = ref(0);
const aiParsing = ref(false);
const multilineAppliedHandler = ref<(() => void) | null>(null);
const isAiConfigValid = computed(() => {
  const provider = llmProviderCache.getLLMProvider();
  return !!(provider?.apiKey?.trim() && provider?.baseURL?.trim());
});
/*
|--------------------------------------------------------------------------
| 变量相关
|--------------------------------------------------------------------------
*/
const getVariableValue = (label: string) => {
  return variableStore.objectVariable[label];
};
const handleGoToVariableManage = () => {
  valueRichInputRefs.value.forEach(ref => ref?.hideVariablePopover());
  projectNavStore.addNav({
    _id: 'variable',
    projectId,
    tabType: 'variable',
    label: t('变量'),
    head: {
      icon: '',
      color: ''
    },
    saved: true,
    fixed: true,
    selected: true,
  });
};
const setValueRichInputRef = (el: InstanceType<typeof ClRichInput> | null, id: string) => {
  if (el) {
    valueRichInputRefs.value.set(id, el);
  } else {
    valueRichInputRefs.value.delete(id);
  }
};
/*
|--------------------------------------------------------------------------
| 数据变更通知
|--------------------------------------------------------------------------
*/
const emitChange = () => {
  emits('change', localData.value);
};
/*
|--------------------------------------------------------------------------
| 工具函数
|--------------------------------------------------------------------------
*/
// 判断是否是最后一个空元素
const isLastEmptyItem = (data: ApidocProperty<'string' | 'file'>): boolean => {
  const isLast = localData.value[localData.value.length - 1]?._id === data._id;
  const keyEmpty = !data.key || data.key.trim() === '';
  const valueEmpty = !data.value || data.value.trim() === '';
  return isLast && keyEmpty && valueEmpty;
};
// 获取删除按钮提示文本
const getDeleteTooltip = (data: ApidocProperty<'string' | 'file'>): string => {
  if (data._disableDelete) {
    return data._disableDeleteTip || t('无法删除');
  }
  if (localData.value.length <= 1) {
    return t('至少保留一条数据');
  }
  if (isLastEmptyItem(data)) {
    return t('最后一条空数据不可删除');
  }
  return t('删除');
};
// 高亮文本
const highlightText = (text: string, query: string): string => {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};
// 拖拽控制
const handleDisableDrag = () => {
  enableDrag.value = false;
};
const handleEnableDrag = () => {
  enableDrag.value = true;
};
// 阻止默认键盘事件（Ctrl+Z, Ctrl+Y）
const handlePreventDefaultKeys = (event: KeyboardEvent | Event) => {
  if (!(event instanceof KeyboardEvent)) {
    return;
  }
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;
  const isUndo = event.key.toLowerCase() === 'z';
  const isRedo = event.key.toLowerCase() === 'y';
  if (isCtrlOrCmd && (isUndo || isRedo)) {
    event.preventDefault();
  }
};
/*
|--------------------------------------------------------------------------
| 粘贴处理
|--------------------------------------------------------------------------
*/
// 通用粘贴处理函数
const handleTrimmedInputPaste = (event: ClipboardEvent, apply: (value: string) => void, currentValue: string) => {
  const clipboardData = event.clipboardData;
  if (!clipboardData) {
    return;
  }
  const originalText = clipboardData.getData('text');
  const trimmedText = originalText.trim();
  if (originalText === trimmedText) {
    return;
  }
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const baseValue = typeof target.value === 'string' ? target.value : currentValue;
  const hasSelectionSupport = typeof target.selectionStart === 'number' && typeof target.selectionEnd === 'number';
  if (!hasSelectionSupport) {
    event.preventDefault();
    const nextValue = baseValue + trimmedText;
    target.value = nextValue;
    apply(nextValue);
    return;
  }
  const selectionStart = target.selectionStart ?? baseValue.length;
  const selectionEnd = target.selectionEnd ?? baseValue.length;
  event.preventDefault();
  const prefix = baseValue.slice(0, selectionStart);
  const suffix = baseValue.slice(selectionEnd);
  const nextValue = prefix + trimmedText + suffix;
  target.value = nextValue;
  apply(nextValue);
  nextTick(() => {
    target.setSelectionRange(selectionStart + trimmedText.length, selectionStart + trimmedText.length);
  });
};
// 参数名称粘贴
const handlePasteKey = (event: ClipboardEvent, data: ApidocProperty<'string' | 'file'>) => {
  handleTrimmedInputPaste(event, value => handleChangeKey(value, data), data.key || '');
};
// 参数值粘贴（变量模式）
const handlePasteValueInput = async (event: ClipboardEvent, data: ApidocProperty<'string' | 'file'>) => {
  const clipboardData = event.clipboardData;
  if (!clipboardData) {
    return;
  }
  const text = clipboardData.getData('text').trim();
  // 检查是否超过阈值且是在 Electron 环境
  if (text.length > config.httpNodeConfig.tempFileSizeThreshold && window.electronAPI?.tempFileManager) {
    event.preventDefault();
    const result = await window.electronAPI.tempFileManager.create(text);
    if (result.success) {
      data.value = result.path;
      data._isTempFile = true;
      data._originalSize = text.length;
      message.success(t('大数据已自动存储为临时文件'));
      emitChange();
    } else {
      message.error(result.error || t('创建临时文件失败'));
    }
    return;
  }
  isPasting.value = true;
  handleTrimmedInputPaste(event, value => handleChangeValue(value, data), data.value || '');
  nextTick(() => {
    isPasting.value = false;
  });
};
// 富文本输入粘贴
const handleRichInputPaste = () => {
  isPasting.value = true;
  nextTick(() => {
    isPasting.value = false;
  });
};
// 富文本输入粘贴前检查大数据
const handleBeforePasteValue = async (text: string, shouldPrevent: { value: boolean }, data: ApidocProperty<'string' | 'file'>) => {
  const trimmedText = text.trim();
  if (trimmedText.length > config.httpNodeConfig.tempFileSizeThreshold && window.electronAPI?.tempFileManager) {
    shouldPrevent.value = true;
    const result = await window.electronAPI.tempFileManager.create(trimmedText);
    if (result.success) {
      data.value = result.path;
      data._isTempFile = true;
      data._originalSize = trimmedText.length;
      message.success(t('大数据已自动存储为临时文件'));
      emitChange();
    } else {
      message.error(result.error || t('创建临时文件失败'));
    }
  }
};
// 参数描述粘贴
const handlePasteDescription = (event: ClipboardEvent, data: ApidocProperty<'string' | 'file'>) => {
  handleTrimmedInputPaste(event, value => handleChangeDescription(value, data), data.description || '');
};
/*
|--------------------------------------------------------------------------
| 参数名称相关
|--------------------------------------------------------------------------
*/
// 参数名称输入框聚焦
const handleFocusKey = () => {
  hasUserInput.value = false;
  handleDisableDrag();
};
// 参数名称联想查询
const querySearchKey = (queryString: string, cb: (results: ApidocProperty[]) => void) => {
  if (!props.mindKeyParams || props.mindKeyParams.length === 0) {
    cb([]);
    currentSuggestions.value = [];
    highlightedIndex.value = -1;
    return;
  }
  if (!hasUserInput.value) {
    cb([]);
    currentSuggestions.value = [];
    highlightedIndex.value = -1;
    return;
  }
  const query = (queryString || '').trim();
  if (!query) {
    currentKeyQuery.value = '';
    cb([]);
    currentSuggestions.value = [];
    highlightedIndex.value = -1;
    return;
  }
  currentKeyQuery.value = query;
  const lowerQuery = query.toLowerCase();
  const results = props.mindKeyParams.filter(item => item.key.toLowerCase().includes(lowerQuery) || (item.description || '').toLowerCase().includes(lowerQuery));
  currentSuggestions.value = results.slice(0, 10);
  highlightedIndex.value = -1;
  cb(currentSuggestions.value);
};
// 参数名称选中事件
const handleSelectKey = (item: ApidocProperty, data: ApidocProperty<'string' | 'file'>) => {
  data.key = item.key;
  if (!(data.description || '').trim()) {
    data.description = item.description || '';
  }
  autoAppendIfNeeded(data);
  emitChange();
};
// Tab键自动填充
const handleTabComplete = (data: ApidocProperty<'string' | 'file'>) => {
  if (currentSuggestions.value.length === 0) {
    return;
  }
  const targetIndex = highlightedIndex.value >= 0 && highlightedIndex.value < currentSuggestions.value.length
    ? highlightedIndex.value
    : 0;
  const selectedItem = currentSuggestions.value[targetIndex];
  if (selectedItem) {
    data.key = selectedItem.key;
    if (!(data.description || '').trim()) {
      data.description = selectedItem.description || '';
    }
    autoAppendIfNeeded(data);
    emitChange();
  }
};
// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent, data: ApidocProperty<'string' | 'file'>) => {
  if (e.key === 'Tab') {
    if (currentSuggestions.value.length > 0) {
      e.preventDefault();
      handleTabComplete(data);
    }
  } else if (e.key === 'ArrowUp') {
    if (currentSuggestions.value.length > 0) {
      highlightedIndex.value = highlightedIndex.value <= 0
        ? currentSuggestions.value.length - 1
        : highlightedIndex.value - 1;
    }
  } else if (e.key === 'ArrowDown') {
    if (currentSuggestions.value.length > 0) {
      highlightedIndex.value = highlightedIndex.value >= currentSuggestions.value.length - 1
        ? 0
        : highlightedIndex.value + 1;
    }
  } else if (e.key !== 'Enter') {
    highlightedIndex.value = -1;
  }
};
// 参数名称修改
const handleChangeKey = (v: string, data: ApidocProperty<'string' | 'file'>) => {
  hasUserInput.value = true;
  data.key = v;
  autoAppendIfNeeded(data);
  emitChange();
};
/*
|--------------------------------------------------------------------------
| 参数值相关
|--------------------------------------------------------------------------
*/
// 参数值修改
const handleChangeValue = (v: string, data: ApidocProperty<'string' | 'file'>) => {
  data.value = v;
  if (isPasting.value) {
    currentOpData.value = null;
  } else if (v.includes('@')) {
    currentOpData.value = data;
  } else {
    currentOpData.value = null;
  }
  emitChange();
};
// 参数值聚焦
const handleFocusValue = (data: ApidocProperty<'string' | 'file'>) => {
  focusedInputId.value = data._id;
  handleDisableDrag();
};
// 参数值失焦
const handleBlurValue = () => {
  setTimeout(() => {
    if (!isMockPanelFocused.value) {
      currentOpData.value = null;
    }
  }, 200);
};
// 参数值失焦并恢复拖拽
const handleBlurValueAndEnableDrag = () => {
  focusedInputId.value = null;
  handleBlurValue();
  handleEnableDrag();
};
// 多行状态变化
const handleMultilineChange = (id: string, isMultiline: boolean) => {
  multilineInputs.value[id] = isMultiline;
};
/*
|--------------------------------------------------------------------------
| 参数类型相关
|--------------------------------------------------------------------------
*/
// 参数类型修改
const handleChangeType = (v: 'string' | 'file', data: ApidocProperty<'string' | 'file'>) => {
  data.type = v;
  if (v === 'file') {
    data.fileValueType = data.fileValueType ?? 'var';
    data.value = '';
    data._error = '';
  } else {
    data.value = '';
    delete data.fileValueType;
    delete data._error;
  }
  emitChange();
};
/*
|--------------------------------------------------------------------------
| Mock 相关
|--------------------------------------------------------------------------
*/
const handleMockInteraction = (status: boolean) => {
  isMockPanelFocused.value = status;
  if (!status && !focusedInputId.value) {
    currentOpData.value = null;
  }
};
// 关闭 Mock 弹窗
const handleCloseMock = () => {
  isMockPanelFocused.value = false;
  currentOpData.value = null;
};
// 选中 Mock 或变量值
const handleSelectMockValue = (item: { source: 'variable' | 'mockjs' | 'faker', value: string }, data: ApidocProperty<'string' | 'file'>) => {
  const currentValue = data.value || '';
  const lastAtIndex = currentValue.lastIndexOf('@');
  let insertValue: string;
  if (item.source === 'variable') {
    insertValue = `{{ ${item.value} }}`;
  } else {
    const symbol = item.source === 'faker' ? '#' : '@';
    insertValue = `{{ ${symbol}${item.value} }}`;
  }
  if (lastAtIndex !== -1) {
    const prefix = currentValue.slice(0, lastAtIndex);
    data.value = `${prefix}${insertValue}`;
  } else {
    data.value = insertValue;
  }
  currentOpData.value = null;
  emitChange();
};
/*
|--------------------------------------------------------------------------
| 临时文件相关
|--------------------------------------------------------------------------
*/
// 清除临时文件
const handleClearTempFile = (data: ApidocProperty<'string' | 'file'>) => {
  if (data._isTempFile && data.value && window.electronAPI?.tempFileManager) {
    window.electronAPI.tempFileManager.delete(data.value);
  }
  data.value = '';
  data._isTempFile = undefined;
  data._originalSize = undefined;
  emitChange();
};
/*
|--------------------------------------------------------------------------
| 文件相关
|--------------------------------------------------------------------------
*/
// 切换文件值类型
const handleToggleFileValueType = (data: ApidocProperty<'string' | 'file'>) => {
  if (data._isTempFile && data.value && window.electronAPI?.tempFileManager) {
    window.electronAPI.tempFileManager.delete(data.value);
  }
  data.fileValueType = data.fileValueType === 'var' ? 'file' : 'var';
  data.value = '';
  data._isTempFile = undefined;
  data._originalSize = undefined;
  emitChange();
};
// 清除文件值
const handleClearFileValue = (data: ApidocProperty<'string' | 'file'>) => {
  data.value = '';
  emitChange();
};
// 选择文件
const handleSelectFile = (e: Event, data: ApidocProperty<'string' | 'file'>) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) {
    data.value = '';
    emitChange();
    return;
  }
  const f = files[0];
  const path = window.electronAPI?.fileManager.getFilePath(f);
  if (!path) {
    data._error = t('未能读取文件路径');
    emitChange();
    return;
  }
  data._error = '';
  data.value = path;
  emitChange();
};
/*
|--------------------------------------------------------------------------
| 其他字段修改
|--------------------------------------------------------------------------
*/
// 必填修改
const handleChangeRequired = (v: boolean, data: ApidocProperty<'string' | 'file'>) => {
  data.required = !!v;
  emitChange();
};
// 参数描述修改
const handleChangeDescription = (v: string, data: ApidocProperty<'string' | 'file'>) => {
  data.description = v;
  emitChange();
};
// 参数描述聚焦
const handleFocusDescription = (data: ApidocProperty<'string' | 'file'>) => {
  handleDisableDrag();
  if (!expandedInputs.value[data._id]) {
    expandedInputs.value[data._id] = { value: false, description: false };
  }
  const shouldExpand = (data.description?.length || 0) > 50 || (data.description?.includes('\n') || false);
  expandedInputs.value[data._id].description = shouldExpand;
};
/*
|--------------------------------------------------------------------------
| 树节点操作
|--------------------------------------------------------------------------
*/
// 判断是否允许放置
const handleAllowDrop = (_: Node, __drop: Node, type: 'inner' | 'prev' | 'next') => {
  return type !== 'inner';
};
// 节点拖拽完成
const handleNodeDrop = (_dragNode: Node, _dropNode: Node, type: 'inner' | 'prev' | 'next') => {
  if (type === 'inner') {
    return;
  }
  emitChange();
};
// 删除行
const handleDeleteRow = (data: ApidocProperty<'string' | 'file'>) => {
  if (localData.value.length <= 1 || data._disableDelete || isLastEmptyItem(data)) {
    return;
  }
  // 如果是临时文件，清理临时文件
  if (data._isTempFile && data.value && window.electronAPI?.tempFileManager) {
    window.electronAPI.tempFileManager.delete(data.value);
  }
  const idx = localData.value.findIndex(i => i._id === data._id);
  if (idx > -1) {
    localData.value.splice(idx, 1);
  }
  if (localData.value.length === 0) {
    localData.value.push(generateEmptyProperty<'string'>());
  }
  emitChange();
};
// 自动追加新行
const autoAppendIfNeeded = (data: ApidocProperty<'string' | 'file'>) => {
  if (data._disableAdd) {
    return;
  }
  const isLast = localData.value[localData.value.length - 1]?._id === data._id;
  const hasKey = (data.key ?? '').trim() !== '';
  if (isLast && hasKey) {
    const nextProperty = generateEmptyProperty<'string'>();
    localData.value.push(nextProperty);
    defaultCheckedKeys.value.push(nextProperty._id);
    nextTick(() => {
      treeRef.value?.setChecked(nextProperty._id, true, false);
      setTimeout(() => {
        treeRef.value?.setChecked(nextProperty._id, true, false);
      }, 0);
    });
  }
};
// 复选框状态变化
const handleCheckChange = (data: ApidocProperty<'string' | 'file'>, select: boolean) => {
  data.select = select;
  emitChange();
};
/*
|--------------------------------------------------------------------------
| 多行编辑模式
|--------------------------------------------------------------------------
*/
type ParseResult = {
  success: boolean;
  data: ApidocProperty<'string'>[];
  errors: string[];
  count: number;
};
// 解析多行文本
const parseMultilineText = (text: string): ParseResult => {
  const lines = text.split('\n').filter(line => line.trim());
  const result: ParseResult = {
    success: true,
    data: [],
    errors: [],
    count: 0,
  };
  const keySet = new Set<string>();
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    if (!trimmedLine.includes('=')) {
      result.errors.push(t('第{0}行: 缺少 = 符号', [lineNum]));
      result.success = false;
      return;
    }
    let required = false;
    let workLine = trimmedLine;
    if (workLine.startsWith('*')) {
      required = true;
      workLine = workLine.slice(1);
    }
    let description = '';
    const commentIndex = workLine.indexOf('//');
    if (commentIndex > -1) {
      description = workLine.slice(commentIndex + 2).trim();
      workLine = workLine.slice(0, commentIndex).trim();
    }
    const equalIndex = workLine.indexOf('=');
    const key = workLine.slice(0, equalIndex).trim();
    const value = workLine.slice(equalIndex + 1).trim();
    if (!key) {
      result.errors.push(t('第{0}行: 参数名不能为空', [lineNum]));
      result.success = false;
      return;
    }
    if (keySet.has(key)) {
      result.errors.push(t('第{0}行: 参数名"{1}"重复', [lineNum, key]));
    }
    keySet.add(key);
    result.data.push({
      _id: generateEmptyProperty<'string'>()._id,
      key,
      value,
      type: 'string',
      required,
      description,
      select: true,
    });
    result.count++;
  });
  return result;
};
// 将数据转换为多行文本
const convertDataToMultilineText = (data: ApidocProperty<'string' | 'file'>[]): string => {
  return data
    .filter(item => item.key?.trim())
    .map(item => {
      const prefix = item.required ? '*' : '';
      const key = item.key || '';
      const value = item.value || '';
      const desc = item.description ? ` //${item.description}` : '';
      return `${prefix}${key}=${value}${desc}`;
    })
    .join('\n');
};
// 多行文本变化
const handleMultilineTextChange = () => {
  if (!multilineText.value.trim()) {
    parseError.value = '';
    parsedCount.value = 0;
    return;
  }
  const result = parseMultilineText(multilineText.value);
  if (result.errors.length > 0) {
    parseError.value = result.errors[0];
  } else {
    parseError.value = '';
  }
  parsedCount.value = result.count;
};
// AI点击处理
const handleAiClick = () => {
  if (!isAiConfigValid.value) {
    appState.setActiveLocalDataMenu('ai-settings');
    router.push('/settings');
    return;
  }
  if (!multilineText.value.trim() || aiParsing.value) {
    return;
  }
  handleAiParse();
};
// AI解析多行文本
const handleAiParse = async () => {
  if (!multilineText.value.trim()) {
    return;
  }
  aiParsing.value = true;
  parseError.value = '';
  try {
    const requestBody: OpenAiRequestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的API参数解析助手。请将用户提供的任意格式文本解析为标准的参数格式。输出格式必须严格遵循：每行一个参数，格式为 *key=value //description 或 key=value //description，其中 * 表示必填参数，// 后面是参数描述。只输出解析结果，不要有任何额外说明。'
        },
        {
          role: 'user',
          content: multilineText.value
        }
      ],
      max_tokens: 2000
    };
    const result = await llmClientStore.chat(requestBody);
    const content = result?.choices?.[0]?.message?.content || '';
    if (content) {
      multilineText.value = content.trim();
      handleMultilineTextChange();
    } else {
      message.error(t('AI返回内容为空'));
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    message.error(errorMsg);
  } finally {
    aiParsing.value = false;
  }
};
// 应用多行文本
const handleApplyMultiline = () => {
  const result = parseMultilineText(multilineText.value);
  if (!result.success) {
    return;
  }
  localData.value = result.data;
  if (localData.value.length === 0) {
    localData.value.push(generateEmptyProperty<'string'>());
  }
  defaultCheckedKeys.value = localData.value.filter(item => item.select).map(item => item._id);
  nextTick(() => {
    localData.value.forEach(item => {
      if (item.select) {
        treeRef.value?.setChecked(item._id, true, false);
      }
    });
  });
  emitChange();
  multilineAppliedHandler.value?.();
  emits('multiline-applied');
};
//取消多行编辑，返回表格模式
const multilineCancelledHandler = ref<(() => void) | null>(null);
const handleCancelMultiline = () => {
  multilineCancelledHandler.value?.();
  emits('multiline-cancelled');
};
const registerMultilineAppliedHandler = (handler: () => void) => {
  multilineAppliedHandler.value = handler;
};
const registerMultilineCancelledHandler = (handler: () => void) => {
  multilineCancelledHandler.value = handler;
};
defineExpose({
  onMultilineApplied: registerMultilineAppliedHandler,
  onMultilineCancelled: registerMultilineCancelledHandler,
});
/*
|--------------------------------------------------------------------------
| 数据监听
|--------------------------------------------------------------------------
*/
watch(
  () => props.data,
  (newVal) => {
    if (!newVal) {
      return;
    }
    if (isEqual(newVal, localData.value)) {
      return;
    }
    localData.value = newVal.map(i => ({ ...i }));
    if (localData.value.length === 0) {
      localData.value.push(generateEmptyProperty<'string'>());
    }
    defaultCheckedKeys.value = localData.value.filter(item => item.select).map(item => item._id);
    if (props.editMode === 'multiline') {
      multilineText.value = convertDataToMultilineText(localData.value);
      handleMultilineTextChange();
    }
  },
  { deep: true, immediate: true },
);
watch(
  () => props.editMode,
  (newMode) => {
    if (newMode === 'multiline') {
      multilineText.value = convertDataToMultilineText(localData.value);
      handleMultilineTextChange();
    }
  },
);
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
    font-size: 13px;
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
    height: 28px;

    &.is-multiline {
      .value-rich-input :deep(.cl-rich-input__editor) {
        border-color: var(--gray-400);
      }
    }

    &.is-pinned {
      z-index: var(--cl-rich-input-pinned-z-index);
    }

    .value-rich-input {
      width: 100%;
      height: 100%;

      :deep(.cl-rich-input__editor) {
        padding: 0px 10px;
        border: 1px solid transparent;
        border-bottom-color: var(--gray-400);
        margin-left: -1px;
        margin-top: -1px;
        border-radius: 4px;
        min-height: 28px;
        line-height: 18px;

        .ProseMirror {
          font-size: 12px;
          line-height: 18px;
          color: var(--el-input-text-color, var(--el-text-color-regular));

          p {
            line-height: 28px;
          }

          p.is-editor-empty:first-child::before {
            color: var(--gray-400);
          }
        }
      }

      :deep(.cl-rich-input__editor::-webkit-scrollbar) {
        width: 3px;
        height: 3px;
      }

      :deep(.cl-rich-input__editor::-webkit-scrollbar-thumb) {
        background: var(--gray-500);
      }
    }
  }

  .temp-file-display {
    display: flex;
    align-items: center;
    height: 28px;
    border: 1px solid var(--el-color-success-light-5);
    border-radius: 4px;
    background-color: var(--el-color-success-light-9);
    padding: 0 8px;

    &.var-temp-file {
      flex: 1;
    }

    .temp-file-info {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;

      .temp-file-icon {
        color: var(--el-color-success);
        flex-shrink: 0;
      }

      .temp-file-size {
        font-size: 12px;
        color: var(--el-color-success-dark-2);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .temp-file-clear {
        flex-shrink: 0;
        cursor: pointer;
        color: var(--gray-500);
        transition: color 0.2s;

        &:hover {
          color: var(--red);
        }
      }
    }
  }

  .file-input-wrap {
    width: 100%;
    box-sizing: content-box;
    cursor: default;
    border: 1px dashed var(--border-base);
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
      border: 1px solid var(--border-base);
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

    .var-mode,
    .file-mode {
      cursor: pointer;

      &:hover {
        color: var(--theme-color);
      }
    }

    .file-mode-wrap {
      width: 100%;
      height: 28px;
      display: flex;
      align-items: center;
      padding-left: 10px;
      padding-right: 24px;

      .label {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-secondary);
        cursor: pointer;
        padding-left: 0;
        margin-left: -10px;
        padding-right: 24px;
      }

      .text-wrap {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .close {
        position: absolute;
        right: 24px;
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

  .file-value-wrapper {
    position: relative;
  }

  .file-error {
    position: absolute;
    left: 0;
    top: 100%;
    font-size: 11px;
    color: var(--el-color-danger);
    line-height: 1.2;
    margin-top: 2px;
  }

  .params-variable-token {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    word-break: break-all;
  }

  .variable-popover {
    max-width: 400px;

    .variable-name {
      font-weight: 500;
      color: var(--gray-800);
      margin-bottom: 6px;
      word-break: break-all;
    }

    .variable-value {
      font-family: monospace;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
      padding: 4px 8px;
      background: var(--gray-200);
      border-radius: 4px;
      color: var(--gray-800);
    }

    .variable-warning {
      color: var(--el-color-danger);
      margin-bottom: 8px;
    }
  }
}

.multiline-editor {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  gap: 12px;

  .textarea-wrapper {
    position: relative;

    .multiline-textarea {
      :deep(.el-textarea__inner) {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
        resize: vertical;
        min-height: 400px;
        padding-bottom: 50px;
      }
    }

    .textarea-actions {
      position: absolute;
      right: 12px;
      bottom: 12px;
      display: flex;
      gap: 8px;
      z-index: 1;

      .ai-parse-btn {
        font-size: 20px;
        cursor: pointer;
        color: var(--color-text-2);
        transition: color 0.2s;

        &:hover:not(.disabled) {
          color: var(--el-color-primary);
        }

        &.disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }
      }
    }
  }

  .multiline-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .format-tip {
      font-size: 12px;
      color: var(--color-text-3);
      line-height: 1.5;
    }

    .parse-error {
      font-size: 12px;
      color: var(--red);
      padding: 8px 12px;
      background-color: var(--red-1);
      border-radius: 4px;
      border-left: 3px solid var(--red);
    }
  }
}
</style>
<style lang='scss'>
.el-tree-node:focus>.el-tree-node__content {
  background: none;
}

.el-tree-node__content {
  height: 50px;
  padding-right: 10px;

  &:hover {
    background: var(--gray-200);
  }
}

.el-tree__drop-indicator {
  height: 3px;
}

// 禁用动画提高性能
.el-collapse-transition-enter-active,
.el-collapse-transition-leave-active {
  transition: none !important;
}

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
