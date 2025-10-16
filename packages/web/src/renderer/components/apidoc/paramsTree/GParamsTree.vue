<template>
  <el-tree 
    ref="tree" 
    :data="data" 
    :indent="50" 
    node-key="_id" 
    :expand-on-click-node="false"
    :draggable="drag && enableDrag" 
    :allow-drop="handleCheckNodeCouldDrop" 
    :show-checkbox="showCheckbox"
    :check-on-click-leaf="false"
    :default-expanded-keys="expandKeys" 
    :default-checked-keys="defaultCheckedKeys" 
    @node-drop="handleNodeDrop"
    @check-change="handleCheckChange">
    <template #default="scope">
      <div class="custom-params-tree-node">
        <!-- 新增嵌套数据按钮 -->
        <el-button 
          v-if="!props.noAdd && !disableAdd" 
          :title="addTip(scope.data)" 
          :icon="Plus" text 
          :disabled="!nest"
          @click="addNestTreeData(scope.data)">
        </el-button>
        <!-- 删除一行数据按钮 -->
        <el-button 
          v-if="!disableDelete" 
          class="mr-2" 
          :disabled="checkDeleteDisable(scope)"
          :title="deleteTip(scope)" 
          text
          :icon="Close" @click="handleDeleteParams(scope)">
        </el-button>
        <!-- 参数key值录入 -->
        <div class="w-15 flex0 mr-2 d-flex a-center">
          <SValidInput 
            :model-value="scope.data.key"
            :disabled="checkKeyDisable(scope)"
            :title="keyTip(scope)" 
            :placeholder="convertKeyPlaceholder(scope)" 
            :select-data="[]"
            one-line 
            @remote-select="handleRemoteSelectKey($event, scope.data)"
            @update:modelValue="handleChangeKeyData($event, scope)" 
            @focus="enableDrag = false" 
            @blur="handleCheckKeyField(scope); enableDrag = true">
          </SValidInput>
          <!-- <div v-else class="readonly-key" @mouseover="() => enableDrag = false" @mouseout="() => enableDrag = true">{{ scope.data.key }}</div> -->
        </div>
        <!-- 请求参数类型 -->
        <el-select 
          :model-value="scope.data.type" 
          :disabled="!nest && !enableFile"
          :placeholder="t('类型')" 
          class="w-15 flex0 mr-2" 
          :size="config.renderConfig.layout.size"
          
          @update:modelValue="handleChangeParamsType($event, scope.data)"
        >
          <el-option :disabled="scope.data.children && scope.data.children.length > 0" label="String"
            value="string"></el-option>
          <el-option v-if="!enableFile" :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Number"
            value="number"></el-option>
          <el-option v-if="!enableFile" :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Boolean"
            value="boolean"></el-option>
          <el-option v-if="!enableFile" :disabled="!nest" label="Object" value="object"></el-option>
          <el-option v-if="!enableFile" :disabled="!nest" label="List | Array" value="array"></el-option>
          <el-option :disabled="!enableFile" :title="t('传输数据类型为formData才能使用file类型')" label="File"
            value="file"></el-option>
        </el-select>
        <!-- 字符串类型录入 -->
        <SValidInput
          v-if="scope.data.type !== 'boolean' && scope.data.type !== 'file'"
          :model-value="scope.data.value"
          class="w-25 mr-2"
          :disabled="checkValueDisable(scope.data)"
          :placeholder="getValuePlaceholder(scope.data)"
          @update:modelValue="handleChangeValue($event, scope.data)"
          @focus="handleFocusValue()"
          @blur="handleBlurValue()">
        </SValidInput>
        <!-- 布尔值类型录入 -->
        <el-select v-if="scope.data.type === 'boolean'" :model-value="scope.data.value" :placeholder="t('请选择')"
          class="w-25 flex0" :size="config.renderConfig.layout.size"
          @update:modelValue="handleChangeBooleanValue($event, scope.data)">
          <el-option label="true" value="true"></el-option>
          <el-option label="false" value="false"></el-option>
        </el-select>
        <!-- 文件类型参数录入 -->
        <div 
          v-if="scope.data.type === 'file'" 
          class="w-25 mr-2"
          :class="{ active: scope.data.value, 'no-border': (scope.data.fileValueType === 'var' || scope.data.fileValueType === 'file') }" 
          @mouseenter="() => enableDrag = false"
          @mouseleave="() => enableDrag = true"
        >
          <div class="file-input-wrap">
            <!-- 模式切换提示 -->
            <div v-if="scope.data.fileValueType !== 'file' && scope.data.fileValueType !== 'var'" class="mode-list">
              <span class="var-mode" @click="() => scope.data.fileValueType = 'var'">{{ t('变量模式') }}</span>
              <span class="px-3"></span>
              <span class="file-mode" @click="() => scope.data.fileValueType = 'file'">{{ t('文件模式') }}</span>
            </div>
            <!-- 变量模式 -->
            <SValidInput 
              v-if="scope.data.fileValueType === 'var'"
              :model-value="scope.data.value" 
              class="w-100" 
              :disabled="checkValueDisable(scope.data)" 
              :placeholder="t('变量模式') + ' eg: ' + t('{0} fileValue {1}', ['{{', '}}'])"
              @update:modelValue="handleChangeValue($event, scope.data)" 
              @focus="handleFocusValue()"
              @blur="handleBlurValue">
            </SValidInput>
            <div v-if="scope.data.fileValueType === 'file'" class="file-mode-wrap">
              <label v-show="!scope.data.value" :for="scope.data.key" class="label">{{ t("选择文件") }}</label>
              <span class="text-wrap" :title="scope.data.value">{{ scope.data.value }}</span>
              <el-icon v-if="scope.data.value" class="close" :size="16" @click="handleClearSelectType(scope.data)">
                <close />
              </el-icon>
            </div>
            <div 
              v-if="scope.data.fileValueType === 'file' || scope.data.fileValueType === 'var'" 
              :title="t('切换变量选择模式，支持变量或者直接选择文件')" 
              class="toggle-mode"
              @click="handleChangeFileValueType(scope.data)"
            >
              <el-icon><Switch /></el-icon>
            </div>
            <input 
              :id="scope.data.key" 
              ref="fileInput" 
              class="d-none" 
              type="file"
              @change="handleSelectFile($event, scope.data)"
            ></input>
          </div>
          <!-- 错误提示 -->
          <div v-if="scope.data._error" class="file-error">{{scope.data._error}}</div>
        </div>
        <!-- 参数是否必填 -->
        <el-checkbox 
          v-if="!noRequiredCheckbox" 
          :model-value="scope.data.required" 
          :label="t('必有')" 
          class="pr-2"
          :disabled="checkRequiredDisable(scope.data)"
          @update:modelValue="handleChangeIsRequired($event as string, scope.data)">
        </el-checkbox>
        <!-- 参数描述 -->
        <SValidInput 
          :model-value="scope.data.description" 
          :disabled="checkDescriptionDisable(scope)" 
          class="w-40"
          :placeholder="t('参数描述与备注')"
          @focus="enableDrag = false"
          @blur="handleDescriptionBlur"
          @update:modelValue="handleChangeDescription($event, scope.data)">
        </SValidInput>
      </div>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
import {
  ref,
  Ref,
  PropType,
  watch
} from 'vue'
import { Plus, Close, Switch } from '@element-plus/icons-vue'
import type Node from 'element-plus/es/components/tree/src/model/node'
import type { TreeNodeOptions } from 'element-plus/lib/components/tree/src/tree.type'
import type { ApidocProperty, HttpNodePropertyType } from '@src/types'
import { apidocGenerateProperty, forEachForest } from '@/helper/index'
import { useI18n } from 'vue-i18n'
import { useApidoc } from '@/store/apidoc/apidoc'
import SValidInput from '@/components/common/validInput/GValidInput.vue'
import { config } from '@src/config/config'

type TreeNode = {
  level: number,
  data: ApidocProperty,
  parent: TreeNode,
  nextSibling: TreeNode,
  node: Node,
}
type RootTreeNode = {
  level: number,
  data: ApidocProperty[],
  parent: RootTreeNode
}
const props = defineProps({
  data: {
    type: Array as PropType<ApidocProperty[]>,
    default: () => [],
  },
  showCheckbox: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否允许添加子参数，eg：当请求方式为GET时，请求参数只能为扁平数据
   */
  nest: {
    type: Boolean,
    default: false,
  },
  /**
   * 字段field是否只读，Path参数字段值不允许修改
   */
  readonlyKey: {
    type: Boolean,
    default: false,
  },
  /**
   * 禁止新增，Path参数字段值不允许新增
   */
  disableAdd: {
    type: Boolean,
    default: false,
  },
  /**
   * 禁止新增，Path参数字段值不允许删除
   */
  disableDelete: { //禁止删除
    type: Boolean,
    default: false,
  },
  /**
   * 不显示必有checkbox
   */
  noRequiredCheckbox: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否允许file类型
   */
  enableFile: {
    type: Boolean,
    default: false,
  },
  /**
   * 展开的节点key值
   */
  expandKeys: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /**
   * 只读的key值
   */
  readonlyKeys: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /**
   * 是否允许拖拽
   */
  drag: {
    type: Boolean,
    default: true,
  },
  /**
   * 联想参数
   */
  mindParams: {
    type: Array as PropType<ApidocProperty[]>,
    default: () => []
  },
  /**
   * 移除新增按钮
   */
  noAdd: {
    type: Boolean,
    default: false,
  },
  /**
   * 移除删除按钮
   */
  noDelete: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['change'])
const { t } = useI18n()
/*
|--------------------------------------------------------------------------
| 基础变量
|--------------------------------------------------------------------------
|
*/
const defaultExpandedKeys: Ref<string[]> = ref([]);
const defaultCheckedKeys: Ref<string[]> = ref([]);
const tree: Ref<TreeNodeOptions['store'] | null> = ref(null)
watch(() => props.data, (data) => {
  const expandKeys: string[] = [];
  const selectKeys: string[] = [];
  forEachForest(data, (val) => {
    expandKeys.push(val._id);
    if (val.select) {
      selectKeys.push(val._id);
    }
  });
  defaultCheckedKeys.value = selectKeys;
  defaultExpandedKeys.value = expandKeys;
  emits('change');
}, {
  deep: true,
  immediate: true,
});
/*
|--------------------------------------------------------------------------
| 拖拽相关处理
|--------------------------------------------------------------------------
*/
const enableDrag = ref(true);
const handleCheckNodeCouldDrop = (_: Node, dropNode: Node, type: 'inner' | 'prev' | 'next') => {
  if (!props.nest) {
    return type !== 'inner';
  }
  if (props.nest && dropNode.parent && dropNode.parent.level === 0) { //只允许有一个根元素
    return false;
  }
  return true;
}
const handleNodeDrop = (_: Node, dropNode: Node, type: 'inner' | 'prev' | 'next') => {
  if (type === 'inner') {
    dropNode.data.type = 'object';
    dropNode.data.value = '';
  }
  // tree.value.setChecked(draggingNode.data._id, true, false);
}
/*
|--------------------------------------------------------------------------
| 数据新增和数据删除
|--------------------------------------------------------------------------
*/
const apidocStore = useApidoc()
//新增按钮title提示信息
const addTip = (data: ApidocProperty) => {
  if (data._disableAdd) {
    return t(data._disableAddTip ?? '不允许新增数据');
  }
  if (!props.nest) {
    return t('参数不允许嵌套，例如：当请求方式为get时，请求参数只能为扁平数据');
  }
  return t('添加一条嵌套数据');
}
const deleteTip = (scope: TreeNode) => {
  if (scope.data._disableDelete) {
    return t(scope.data._disableDeleteTip ?? '不允许删除数据');
  }
  if (!scope.node.nextSibling && scope.node.level === 1) {
    return t('此项不允许删除')
  }
  return t('删除当前行');
}


//新增嵌套数据
const addNestTreeData = (data: ApidocProperty) => {
  const params = apidocGenerateProperty();
  if (data.type !== 'object' && data.type !== 'array') {
    apidocStore.changePropertyValue({
      data,
      field: 'type',
      value: 'object',
    });
  }
  apidocStore.addProperty({
    data: data.children!,
    params,
  });

  setTimeout(() => { //hack，添加一个数据默认选中当前数据
    tree.value?.setChecked(params._id, true, true);
    defaultExpandedKeys.value = [params._id];
  })
}
//删除一条数据
const handleDeleteParams = ({ node, data }: { node: TreeNode | RootTreeNode, data: ApidocProperty }) => {
  const parentNode = node.parent;
  const parentData = node.parent.data;
  if (parentNode.level === 0) { //根节点直接删除，非根节点在children里删除
    const deleteIndex = (parentData as RootTreeNode['data']).findIndex((val) => val._id === data._id);
    if ((parentData as RootTreeNode['data']).length - 1 === deleteIndex) { //不允许删除最后一个元素
      return;
    }
    apidocStore.deleteProperty({
      data: parentData as RootTreeNode['data'],
      index: deleteIndex,
    })
  } else {
    const deleteIndex = (parentData as TreeNode['data']).children?.findIndex((val) => val._id === data._id);
    apidocStore.deleteProperty({
      data: (parentData as TreeNode['data']).children ?? [],
      index: deleteIndex ?? -1,
    })
  }
};
//是否禁用删除按钮
const checkDeleteDisable = ({ node }: { node: TreeNode }) => {
  if (node.data._disableDelete) {
    return true;
  }
  const isReadOnly = !!props.readonlyKeys.find(key => key === node.data.key);
  return (!node.nextSibling && node.level === 1) || isReadOnly;
}
/*
|--------------------------------------------------------------------------
| 参数key值录入
|--------------------------------------------------------------------------
*/
//改变key的值
const handleChangeKeyData = (val: string, { node, data }: { node: TreeNode | RootTreeNode, data: ApidocProperty }) => {
  apidocStore.changePropertyValue({
    data,
    field: 'key',
    value: val,
  })
  if (node.level === 1 && props.nest) { //只允许有一个根元素
    return;
  }
  if (data.key && data.key.trim() !== '') {
    const parentNode = node.parent;
    const parentData = node.parent.data as TreeNode['data'];
    const rootParentData = node.parent.data as RootTreeNode['data'];
    if (parentNode.level === 0) { //根节点直接往数据里面push，非根节点往children里push
      if ((rootParentData)[(rootParentData).length - 1].key && (rootParentData)[(rootParentData).length - 1].key.trim() !== '') {
        apidocStore.addProperty({
          data: rootParentData,
          params: apidocGenerateProperty(),
        })
      }
    } else if (parentData.children?.[parentData.children.length - 1].key && parentData.children[parentData.children.length - 1].key.trim() !== '') {
      apidocStore.addProperty({
        data: parentData.children,
        params: apidocGenerateProperty(),
      })
    }
    tree.value?.setChecked(data._id, true, true);
  }
}
//检查key输入框是否被禁用
const checkKeyDisable = ({ node }: { node: TreeNode }) => {
  if (node.data._disableKey) {
    return true;
  }
  const isReadOnly = !!props.readonlyKeys.find(key => key === node.data.key);
  const parentIsArray = node.parent.data.type === 'array';
  const isRootObject = props.nest && node.level === 1;
  return parentIsArray || isRootObject || props.disableAdd || isReadOnly;
}
const keyTip = ({ node }: { node: TreeNode }) => {
  if (node.data._disableKeyTip) {
    return t(node.data._disableKeyTip);
  }

  if (node.level === 1 && props.nest) {
    return t('根元素');
  }
  if (node.parent.data.type === 'array') {
    return t('父元素为数组不必填写参数名称');
  }
  if (node.data.disabled) {
    return t('该请求头无法修改，也无法取消发送');

  }
  return t('输入参数名称自动换行');
}
//转换key输入框placeholder值
const convertKeyPlaceholder = ({ node }: { node: TreeNode }) => {
  if (node.level === 1 && props.nest) {
    return t('根元素');
  }
  if (node.parent.data.type === 'array') {
    return t('父元素为数组不必填写参数名称');
  }
  if (node.data.disabled) {
    return t('该请求头无法修改，也无法取消发送');

  }
  return t('输入参数名称自动换行');
}
//校验key值是否满足规范
const handleCheckKeyField = ({ node, data }: { node: TreeNode | RootTreeNode, data: ApidocProperty }) => {
  const parentNode = node.parent;
  const parentData = node.parent.data as TreeNode['data'];
  const rootParentData = node.parent.data as RootTreeNode['data'];
  const nodeIndex = (parentNode.level === 0) ? rootParentData.findIndex((val) => val._id === data._id) : parentData.children?.findIndex((val) => val._id === data._id);
  if (parentNode.level === 0 && rootParentData.length === 1) { //根元素第一个可以不必校验因为参数可以不必填
    return;
  }
  if (nodeIndex !== rootParentData.length - 1) { //只要不是最后一个值都需要做数据校验
    console.log('校验')
  }
}
//获取远端返回的key值
const handleRemoteSelectKey = (item: ApidocProperty, data: ApidocProperty) => {
  apidocStore.changePropertyValue({
    data,
    field: 'key',
    value: item.key,
  });
  apidocStore.changePropertyValue({
    data,
    field: 'value',
    value: item.value,
  });
  apidocStore.changePropertyValue({
    data,
    field: 'description',
    value: item.description,
  });
}
/*
|--------------------------------------------------------------------------
| 参数类型选择
|--------------------------------------------------------------------------
*/
//改变参数类型
const handleChangeParamsType = (value: string, data: ApidocProperty) => {
  apidocStore.changePropertyValue({
    data,
    field: 'type',
    value: value as HttpNodePropertyType,
  })

  if (data.type === 'boolean') {
    apidocStore.changePropertyValue({
      data,
      field: 'value',
      value: 'true',
    })
  } else if (data.type === 'file') {
    apidocStore.changePropertyValue({
      data,
      field: 'value',
      value: '',
    })
  } else if (data.type === 'number') {
    const couldConvertToNumber = !Number.isNaN(Number(data.value));
    if (!couldConvertToNumber) {
      apidocStore.changePropertyValue({
        data,
        field: 'value',
        value: '0',
      })
    }
  } else if (data.type === 'object' || data.type === 'array') {
    if (data.type === 'array' && data.children && data.children.length > 0) { //清空子元素所有参数名称
      data.children.forEach(_data => {
        apidocStore.changePropertyValue({
          data,
          field: 'key',
          value: '',
        })
      })
    }
    apidocStore.changePropertyValue({
      data,
      field: 'value',
      value: '',
    })
    defaultExpandedKeys.value.push(data._id);
  }
}
/*
|--------------------------------------------------------------------------
| 参数值填写
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| 值录入
|--------------------------------------------------------------------------
|
*/
const getValuePlaceholder = (data: ApidocProperty) => {
  if (data._valuePlaceholder) {
    return data._valuePlaceholder;
  }
  if (data.type === 'object') {
    return t('对象类型无需填写')
  }
  return t('请输入值');
}
const handleChangeValue = (value: string, data: ApidocProperty) => {
  apidocStore.changePropertyValue({
    data,
    field: 'value',
    value,
  })
}
const handleChangeBooleanValue = (value: string, data: ApidocProperty) => {
  apidocStore.changePropertyValue({
    data,
    field: 'value',
    value,
  })
}
const handleFocusValue = () => {
  enableDrag.value = false;
}
const handleBlurValue = () => {
  enableDrag.value = true;
}
const handleChangeFileValueType = (data: ApidocProperty) => {
  data.value = '';
  if (data.fileValueType === 'file') {
    data.fileValueType = 'var'
  } else {
    data.fileValueType = 'file'
  }
}

const fileInput: Ref<HTMLInputElement | null> = ref(null);
const handleClearSelectType = (data: ApidocProperty) => {
  if (fileInput.value) {
    (fileInput.value as HTMLInputElement).value = '';
  }
  apidocStore.changePropertyValue({
    data,
    field: 'value',
    value: '',
  })
}
//选择文件
const handleSelectFile = (e: Event, data: ApidocProperty) => {
  const { files } = (e.target as HTMLInputElement);
  if (files) {
    const file = files[0];
    const path = window.electronAPI?.fileManager.getFilePath(file) || ""
    apidocStore.changePropertyValue({
      data,
      field: 'value',
      value: path,
    })
  }
}
//判断是否禁用value输入
const checkValueDisable = (data: ApidocProperty) => {
  if (data._disableValue) {
    return true;
  }
  const isReadOnly = !!props.readonlyKeys.find(key => key === data.key);
  return data.type === 'object' || isReadOnly
}
/*
|--------------------------------------------------------------------------
| 参数是否必填
|--------------------------------------------------------------------------
|
*/
const handleChangeIsRequired = (value: string, data: ApidocProperty) => {
  apidocStore.changePropertyValue({
    data,
    field: 'required',
    value: !!value,
  })
}
//是否必填
const checkRequiredDisable = (data: ApidocProperty) => {
  const isReadOnly = !!props.readonlyKeys.find(key => key === data.key);
  return isReadOnly
}
/*
|--------------------------------------------------------------------------
| 参数备注填写
|--------------------------------------------------------------------------
|
*/
const handleDescriptionBlur = () => {
  enableDrag.value = true;
}
const handleChangeDescription = (value: string, data: ApidocProperty) => {
  apidocStore.changePropertyValue({
    data,
    field: 'description',
    value,
  })
}

const handleCheckChange = (data: ApidocProperty, select: boolean) => {
  console.log('handleCheckChange', data, select);
  apidocStore.changePropertyValue({
    data,
    field: 'select',
    value: select,
  })
}
//备注是否禁止
const checkDescriptionDisable = ({ node }: { node: TreeNode }) => {
  if (node.data._disableDescription) {
    return true;
  }
  const isReadOnly = !!props.readonlyKeys.find(key => key === node.data.key);
  return node.parent.data.type === 'array' || isReadOnly;
}
</script>

<style lang='scss'>
.custom-params-tree-node {
  width: 100%;
  display: flex;
  align-items: center;

  .el-input--default {
    .el-input__wrapper {
      box-shadow: none;
    }
  }

  .el-select .el-input--default {
    .el-input__wrapper {
      box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    }
  }

  .el-button.is-text {
    padding: 0;
  }

  .el-input-number .el-input__inner {
    text-align: left;
  }

  .el-select .el-input__inner {
    border-bottom: none;
  }

  .el-input__inner {
    border-radius: 0;
    border: none;
    border-bottom: 1px solid var(--gray-400);
    font-size: fz(12);
    box-shadow: none;
  }
  .el-select__wrapper {
    font-size: fz(12);
  }
  .el-input__wrapper {
    &:focus {
      border-bottom: 2px solid var(--theme-color);
      margin-bottom: -1px;
    }
  }

  .valid-input .ipt-wrap .ipt-inner {
    border: none;
    border-radius: 0;
    border-color: var(--gray-400);
    border-bottom: 1px solid var(--gray-400);
    font-size: fz(12);
  }
  .file-error {
    color: var(--red);
    font-size: fz(12);
  }
  .file-input-wrap {
    cursor: default;
    border: 1px dashed var(--gray-400);
    display: flex;
    align-items: center;
    height: 30px;
    position: relative;
    font-size: 13px;
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

.el-tree-node:focus>.el-tree-node__content {
  background: none;
}

.el-tree-node__content {
  height: 50px;

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
</style>
