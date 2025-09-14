<template>
  <el-tree-v2
    ref="tree"
    :data="data"
    :indent="50"
    :height="400"
    :props="treeProps"
    :expand-on-click-node="false"
    :draggable="drag && enableDrag"
    :allow-drop="handleCheckNodeCouldDrop"
    :show-checkbox="showCheckbox"
    :default-expanded-keys="defaultExpandedKeys"
    :default-checked-keys="defaultCheckedKeys"
    @node-drop="handleNodeDrop"
    @check-change="handleCheckChange"
  >
    <template #default="scope">
      <div class="custom-params-tree-node2">
        <!-- 新增嵌套数据按钮 -->
        <el-button
          v-if="!disableAdd"
          type="text"
          :title="addNestTip"
          :icon="Plus"
          :disabled="!nest"
          @click="addNestTreeData(scope.data)"
        >
        </el-button>
        <!-- 删除一行数据按钮 -->
        <el-button
          v-if="!disableDelete"
          class="mr-2"
          :disabled="checkDeleteDisable(scope)"
          :title="`${(!scope.node.nextSibling && scope.node.level === 1) ? t('此项不允许删除') : t('删除当前行')}`"
          type="text"
          :icon="Close"
          @click="handleDeleteParams(scope)"
        >
        </el-button>
        <!-- 参数key值录入 -->
        <div class="w-15 flex0 mr-2 d-flex a-center">
          ddddddd
        </div>
        <!-- 请求参数类型 -->
        <el-select
          :model-value="scope.data.type"
          :disabled="!nest && !enableFile"
          :title="typeTip"
          :placeholder="t('类型')"
          class="w-15 flex0 mr-2"
          :size="config.renderConfig.layout.size"
          @update:modelValue="handleChangeParamsType($event, scope.data)"
        >
          <el-option :disabled="scope.data.children && scope.data.children.length > 0" label="String" value="string"></el-option>
          <el-option :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Number" value="number"></el-option>
          <el-option :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Boolean" value="boolean"></el-option>
          <el-option :disabled="!nest" label="Object" value="object"></el-option>
          <el-option :disabled="!nest" label="List | Array" value="array"></el-option>
          <el-option :disabled="!enableFile" :title="t('传输数据类型为formData才能使用file类型')" label="File" value="file"></el-option>
        </el-select>
      </div>
      <div v-if="0" class="custom-params-tree-node2">
        <!-- 新增嵌套数据按钮 -->
        <el-button
          v-if="!disableAdd"
          type="text"
          :title="addNestTip"
          :icon="Plus"
          :disabled="!nest"
          @click="addNestTreeData(scope.data)"
        >
        </el-button>
        <!-- 删除一行数据按钮 -->
        <el-button
          v-if="!disableDelete"
          class="mr-2"
          :disabled="checkDeleteDisable(scope)"
          :title="`${(!scope.node.nextSibling && scope.node.level === 1) ? t('此项不允许删除') : t('删除当前行')}`"
          type="text"
          :icon="Close"
          @click="handleDeleteParams(scope)"
        >
        </el-button>
        <!-- 参数key值录入 -->
        <div class="w-15 flex0 mr-2 d-flex a-center">
          <s-valid-input
            :model-value="scope.data.key"
            :disabled="checkKeyInputDisable(scope)"
            :title="convertKeyPlaceholder(scope)"
            :placeholder="convertKeyPlaceholder(scope)"
            :select-data="[]"
            @remote-select="handleRemoteSelectKey($event, scope.data)"
            @update:modelValue="handleChangeKeyData($event, scope)"
            @focus="enableDrag = false"
            @blur="handleCheckKeyField(scope);enableDrag=true"
          >
          </s-valid-input>
          <!-- <div v-else class="readonly-key" @mouseover="() => enableDrag = false" @mouseout="() => enableDrag = true">{{ scope.data.key }}</div> -->
        </div>
        <!-- 请求参数类型 -->
        <el-select
          :model-value="scope.data.type"
          :disabled="!nest && !enableFile"
          :title="typeTip"
          :placeholder="t('类型')"
          class="w-15 flex0 mr-2"
          :size="config.renderConfig.layout.size"
          @update:modelValue="handleChangeParamsType($event, scope.data)"
        >
          <el-option :disabled="scope.data.children && scope.data.children.length > 0" label="String" value="string"></el-option>
          <el-option :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Number" value="number"></el-option>
          <el-option :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Boolean" value="boolean"></el-option>
          <el-option :disabled="!nest" label="Object" value="object"></el-option>
          <el-option :disabled="!nest" label="List | Array" value="array"></el-option>
          <el-option :disabled="!enableFile" :title="t('传输数据类型为formData才能使用file类型')" label="File" value="file"></el-option>
        </el-select>
        <!-- 参数值录入 -->
        <el-popover
          v-if="scope.data.type !== 'boolean' && scope.data.type !== 'file'"
          :visible="scope.data._id === currentOpData?._id"
          placement="top-start"
          width="auto"
        >
          <s-mock
            v-if="scope.data.type !== 'boolean' && scope.data.type !== 'file'"
            :search-value="scope.data.value"
            @close="handleCloseMockModel"
            @select="handleSelectMockValue($event, scope.data)"
          >
          </s-mock>
          <template #reference>
            <el-input
              :model-value="scope.data.value"
              :disabled="checkDisableValue(scope.data)"
              :title="t('对象和数组不必填写参数值')"
              class="w-25 flex0"
              :size="config.renderConfig.layout.size"
              :placeholder="getValuePlaceholder(scope.data)"
              @update:modelValue="handleChangeValue($event, scope.data)"
              @focus="handleFocusValue(scope.data)"
              @blur="handleBlurValue"
            >
            </el-input>
          </template>
        </el-popover>
        <!-- 布尔值类型录入 -->
        <el-select
          v-if="scope.data.type === 'boolean'"
          :model-value="scope.data.value"
          :placeholder="t('请选择')"
          class="w-25 flex0"
          :size="config.renderConfig.layout.size"
          @update:modelValue="handleChangeBooleanValue($event, scope.data)"
        >
          <el-option label="true" value="true"></el-option>
          <el-option label="false" value="false"></el-option>
        </el-select>
        <!-- 文件类型参数录入 -->
        <div v-if="scope.data.type === 'file'" class="flex0 w-25">
          <div class="fake-input" :class="{active: scope.data.value}" @mouseenter="() => enableDrag = false" @mouseleave="() => enableDrag = true">
            <label v-show="!scope.data.value" for="fileInput" class="label">{{ t("选择文件") }}</label>
            <s-ellipsis-content :value="scope.data.value" max-width="100%"></s-ellipsis-content>
            <el-icon v-if="scope.data.value" class="close" :size="16" @click="handleClearSelectType(scope.data)">
              <close />
            </el-icon>
          </div>
          <input id="fileInput" ref="fileInput" class="d-none" type="file" @change="handleSelectFile($event, scope.data)">
        </div>
        <!-- 参数是否必填 -->
        <el-checkbox
          :model-value="scope.data.required"
          :label="t('必有')"
          :disabled="checkRequiredDisable(scope.data)"
          @update:modelValue="handleChangeIsRequired($event as string, scope.data)"
        >
        </el-checkbox>
        <!-- 参数描述 -->
        <s-valid-input
          :model-value="scope.data.description"
          :disabled="checkDescriptionDisable(scope)"
          class="w-40 ml-2"
          :placeholder="t('参数描述与备注')"
          @focus="enableDrag = false"
          @blur="handleDescriptionBlur"
          @update:modelValue="handleChangeDescription($event, scope.data)"
        >
        </s-valid-input>
      </div>
    </template>
  </el-tree-v2>
</template>

<script lang="ts" setup>
import {
  ref,
  Ref,
  PropType,
  computed,
  watch
} from 'vue'
import { Plus, Close } from '@element-plus/icons-vue'
import type { TreeNodeOptions } from 'element-plus/lib/components/tree/src/tree.type'
import type { ApidocProperty, MockItem } from '@src/types'
import { apidocGenerateProperty, forEachForest } from '@/helper/index'
import { store } from '@/store'
import { useI18n } from 'vue-i18n'
import { TreeNodeData } from 'element-plus/es/components/tree-v2/src/types'

const treeProps = {
  value: '_id',
}
type TreeNode = {
  level: number,
  data: ApidocProperty,
  parent: TreeNode,
  nextSibling: TreeNode,
}
type RootTreeNode = {
  level: number,
  data: ApidocProperty[],
  parent: RootTreeNode
}
const props = defineProps({
  /**
     * 参数数据
     */
  data: {
    type: Array as PropType<ApidocProperty[]>,
    default: () => [],
  },
  /**
     * 是否展示checkbox
     */
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
|
*/
const enableDrag = ref(true);
const handleCheckNodeCouldDrop = (draggingNode: TreeNode, dropNode: TreeNode, type: 'inner' | 'prev') => {
  if (!props.nest) {
    return type !== 'inner';
  }
  if (props.nest && dropNode.parent.level === 0) { //只允许有一个根元素
    return false;
  }
  return true;
}
const handleNodeDrop = (draggingNode: TreeNode, dropNode: TreeNode, type: 'inner' | 'prev') => {
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
|
*/
//新增按钮title提示信息
const addNestTip = computed(() => {
  if (!props.nest) {
    return t('参数不允许嵌套，例如：当请求方式为get时，请请求参数只能为扁平数据');
  }
  return t('添加一条嵌套数据');
})
//新增嵌套数据
const addNestTreeData = (data: ApidocProperty) => {
  const params = apidocGenerateProperty();
  if (data.type !== 'object' && data.type !== 'array') {
    store.commit('apidoc/apidoc/changePropertyValue', {
      data,
      field: 'type',
      value: 'object',
    });
  }
  store.commit('apidoc/apidoc/addProperty', {
    data: data.children,
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
    store.commit('apidoc/apidoc/deleteProperty', {
      data: parentData,
      index: deleteIndex,
    });
  } else {
    const deleteIndex = (parentData as TreeNode['data']).children.findIndex((val) => val._id === data._id);
    store.commit('apidoc/apidoc/deleteProperty', {
      data: (parentData as TreeNode['data']).children,
      index: deleteIndex,
    });
  }
};
//是否禁用删除按钮
const checkDeleteDisable = ({ node }: { node: TreeNode }) => {
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
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'key',
    value: val,
  });
  if (node.level === 1 && props.nest) { //只允许有一个根元素
    return;
  }
  if (data.key && data.key.trim() !== '') {
    const parentNode = node.parent;
    const parentData = node.parent.data as TreeNode['data'];
    const rootParentData = node.parent.data as RootTreeNode['data'];
    if (parentNode.level === 0) { //根节点直接往数据里面push，非根节点往children里push
      if ((rootParentData)[(rootParentData).length - 1].key && (rootParentData)[(rootParentData).length - 1].key.trim() !== '') {
        store.commit('apidoc/apidoc/addProperty', {
          data: rootParentData,
          params: apidocGenerateProperty(),
        });
      }
    } else if (parentData.children[parentData.children.length - 1].key && parentData.children[parentData.children.length - 1].key.trim() !== '') {
      store.commit('apidoc/apidoc/addProperty', {
        data: parentData.children,
        params: apidocGenerateProperty(),
      });
    }
    tree.value?.setChecked(data._id, true, true);
  }
}
//检查key输入框是否被禁用
const checkKeyInputDisable = ({ node }: { node: TreeNode }) => {
  // const isComplex = node.data.type === "object" || node.data.type === "array"
  const isReadOnly = !!props.readonlyKeys.find(key => key === node.data.key);
  const parentIsArray = node.parent?.data.type === 'array';
  const isRootObject = props.nest && node.level === 1;
  return parentIsArray || isRootObject || props.disableAdd || isReadOnly;
}
//转换key输入框placeholder值
const convertKeyPlaceholder = ({ node }: { node: TreeNode }) => {
  // const isComplex = node.data.type === "array" || node.data.type === "object";
  if (node.level === 1) {
    return t('根元素');
  }
  if (node.parent.data.type === 'array') {
    return t('父元素为数组不必填写参数名称');
  }
  return t('输入参数名称');
}
//校验key值是否满足规范
const handleCheckKeyField = ({ node, data }: { node: TreeNode | RootTreeNode, data: ApidocProperty }) => {
  const parentNode = node.parent;
  const parentData = node.parent.data as TreeNode['data'];
  const rootParentData = node.parent.data as RootTreeNode['data'];
  const nodeIndex = (parentNode.level === 0) ? rootParentData.findIndex((val) => val._id === data._id) : parentData.children.findIndex((val) => val._id === data._id);
  if (parentNode.level === 0 && rootParentData.length === 1) { //根元素第一个可以不必校验因为参数可以不必填
    return;
  }
  if (nodeIndex !== rootParentData.length - 1) { //只要不是最后一个值都需要做数据校验
    console.log('校验')
  }
}
//获取远端返回的key值
const handleRemoteSelectKey = (item: ApidocProperty, data: ApidocProperty) => {
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'type',
    value: item.type,
  });
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'value',
    value: item.value,
  });
  store.commit('apidoc/apidoc/changePropertyValue', {
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
// 禁用参数类型提示
const typeTip = computed(() => {
  if (!props.nest) {
    return t('参数类型不允许改变，eg：当请求方式为get时，请求参数类型只能为string')
  }
  return '';
})
//改变参数类型
const handleChangeParamsType = (value: string, data: ApidocProperty) => {
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'type',
    value,
  });
  if (data.type === 'boolean') {
    store.commit('apidoc/apidoc/changePropertyValue', {
      data,
      field: 'value',
      value: 'true',
    });
  } else if (data.type === 'file') {
    store.commit('apidoc/apidoc/changePropertyValue', {
      data,
      field: 'value',
      value: '',
    });
  } else if (data.type === 'number') {
    const couldConvertToNumber = !Number.isNaN(Number(data.value));
    if (!couldConvertToNumber) {
      store.commit('apidoc/apidoc/changePropertyValue', {
        data,
        field: 'value',
        value: '0',
      });
    }
  } else if (data.type === 'object' || data.type === 'array') {
    if (data.type === 'array' && data.children && data.children.length > 0) { //清空子元素所有参数名称
      data.children.forEach(_data => {
        store.commit('apidoc/apidoc/changePropertyValue', {
          data: _data,
          field: 'key',
          value: '',
        });
      })
    }
    // store.commit("apidoc/apidoc/changePropertyValue", {
    //     data,
    //     field: "key",
    //     value: "",
    // });
    store.commit('apidoc/apidoc/changePropertyValue', {
      data,
      field: 'value',
      value: '',
    });
    defaultExpandedKeys.value.push(data._id);
  }
}
/*
|--------------------------------------------------------------------------
| 参数值填写
|--------------------------------------------------------------------------
*/
//当前操作节点
const currentOpData: Ref<ApidocProperty | null> = ref(null);
//value值placeholder处理
const getValuePlaceholder = (data: ApidocProperty) => {
  if (data.type === 'object') {
    return t('对象类型不必填写')
  }
  if (data.type === 'array') {
    return t('填写数字代表mock数据条数')
  }
  return t('参数值、@代表mock，{0} 变量 {1}', ['{{', '}}'])
}
//改变value值
const handleChangeValue = (value: string, data: ApidocProperty) => {
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'value',
    value,
  });
  if (data.value.startsWith('@')) {
    currentOpData.value = data;
  } else {
    currentOpData.value = null;
  }
}
//改变布尔值
const handleChangeBooleanValue = (value: string, data: ApidocProperty) => {
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'value',
    value,
  });
}
//处理value值focus事件
const handleFocusValue = (data: ApidocProperty) => {
  enableDrag.value = false;
  if (data.value.startsWith('@')) {
    currentOpData.value = data;
  }
}
//处理value值blur事件
const handleBlurValue = () => {
  enableDrag.value = true;
}
//处理value值mock移入
const handleCloseMockModel = () => {
  currentOpData.value = null;
}
//选择某个mock类型数据
const handleSelectMockValue = (item: MockItem, data: ApidocProperty) => {
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'value',
    value: `@${item.value}`,
  });
  currentOpData.value = null;
}
//清空选中的文件
const fileInput: Ref<HTMLInputElement | null> = ref(null);
const handleClearSelectType = (data: ApidocProperty) => {
  if (fileInput.value) {
    (fileInput.value as HTMLInputElement).value = '';
  }
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'value',
    value: '',
  });
}
//选择文件
const handleSelectFile = (e: Event, data: ApidocProperty) => {
  const { files } = (e.target as HTMLInputElement);
  if (files) {
    const file = files[0]
    store.commit('apidoc/apidoc/changePropertyValue', {
      data,
      field: 'value',
      value: file.path,
    });
  }
}
//判断是否禁用value输入
const checkDisableValue = (data: ApidocProperty) => {
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
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'required',
    value,
  });
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
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'description',
    value,
  });
}

const handleCheckChange = (data: TreeNodeData, select: boolean) => {
  store.commit('apidoc/apidoc/changePropertyValue', {
    data,
    field: 'select',
    value: select,
  });
}
//备注是否禁止
const checkDescriptionDisable = ({ node }: { node: TreeNode }) => {
  const isReadOnly = !!props.readonlyKeys.find(key => key === node.data.key);
  return node.parent?.data.type === 'array' || isReadOnly;
}
</script>

<style lang='scss' scoped>
.custom-params-tree-node2 {
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    line-height: 50px;
}
.custom-params-tree-node {
    width: 100%;
    display: flex;
    align-items: center;
    .el-input-number .el-input__inner {
        text-align: left;
    }
    .valid-input .ipt-wrap .ipt-inner {
        border: none;
        border-radius: 0;
        border-color: var(--gray-400);
        border-bottom: 1px solid var(--gray-400);
        font-size: 12px;
        &:focus {
            border-bottom: 2px solid var(--theme-color);
            margin-bottom: -1px;
        }
    }
    .fake-input {
        cursor: pointer;
        background: var(--gray-300);
        height: 25px;
        line-height: 25px;
        text-indent: 1em;
        width: 98%;
        position: relative;
        &.active {
            background: none;
            border: 1px solid var(--gray-300);
            cursor: auto;
        }
        .label {
            width: 100%;
            height: 100%;
            display: inline-block;
            cursor: pointer;
        }
        .close {
            position: absolute;
            right: 3px;
            top: 4px;
            font-size: 16px;
            cursor: pointer;
            &:hover {
                color: var(--red);
            }
        }
    }
}
</style>
