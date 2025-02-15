<template>
  <div class="response-params">
    {{mimeVisibleMap}}

    <SCollapseCard v-for="(item, index) in responseData" :key="index" :fold="collapseState[item._id || ''] === false"
      @change="handleChangeCollapseState($event, item)">
      <!-- 操作区域 -->
      <template #head>
        <div class="info-wrap">
          <div class="label">
            <div class="d-flex a-center">
              <span class="flex0">{{ t("名称") }}：</span>
              <span v-if="(!currentEditNode || currentEditNode.index !== index)" class="edit-title">{{ item.title
                }}</span>
              <input v-if="currentEditNode && currentEditNode.index === index" :ref="bindRef"
                v-model="currentEditNode._title" class="edit-input"
                :class="{ error: currentEditNode._title.length === 0 }" type="text" :placeholder="t('不能为空')"
                @click.stop="() => { }" @keydown.enter="handleConfirmTitle(item, index)">
              <span v-if="currentEditNode && currentEditNode.title === item.title"
                class="ml-1 cursor-pointer theme-color" @click.stop="handleConfirmTitle(item, index)">{{ t("确定")
                }}</span>
              <span v-if="currentEditNode && currentEditNode.title === item.title"
                class="ml-1 cursor-pointer theme-color" @click.stop="handleCancelEdit">{{ t("取消") }}</span>
              <el-icon v-if="!currentEditNode" :title="t('修改名称')" class="edit-icon" :size="16"
                @click.stop="handleChangeEditNode(item, index)">
                <Edit />
              </el-icon>
            </div>
          </div>
          <!-- 状态码 -->
          <el-divider direction="vertical"></el-divider>
          <div class="status-code">
            <div class="d-flex a-center j-center">
              <span class="flex0">{{ t("状态码") }}：</span>
              <el-popover :visible="statusVisibleMap[item._id || '']" width="500px" placement="bottom">
                <template #reference>
                  <span class="d-flex a-center cursor-pointer" @click.stop="toggleStatusModel(item)">
                    <span v-if="item.statusCode >= 100 && item.statusCode < 200" class="green">{{ item.statusCode
                      }}</span>
                    <span v-else-if="item.statusCode >= 200 && item.statusCode < 300" class="green">{{ item.statusCode
                      }}</span>
                    <span v-else-if="item.statusCode >= 300 && item.statusCode < 400" class="orange">{{ item.statusCode
                      }}</span>
                    <span v-else-if="item.statusCode >= 400 && item.statusCode < 500" class="red">{{ item.statusCode
                      }}</span>
                    <span v-else class="red">{{ item.statusCode }}</span>
                    <el-icon :size="16" class="ml-1">
                      <arrow-down />
                    </el-icon>
                  </span>
                </template>
                <SStatus @close="handleCloseStatusModel(item)" @select="handleSelectStatusCode($event, index)">
                </SStatus>
              </el-popover>
            </div>
          </div>
          <!-- content-type -->
          <el-divider direction="vertical"></el-divider>
          <div class="content-type">
            <div class="d-flex a-center j-center">
              <!-- <span class="flex0">{{ t("返回格式") }}：</span> -->
              <el-popover :visible="mimeVisibleMap[item._id || '']" trigger="click" width="500px" placement="bottom">
                <template #reference>
                  <span class="d-flex a-center cursor-pointer" @click.stop="toggleMimeModel(item)">
                    <el-tooltip :show-after="500" :content="item.value.dataType" placement="top" :effect="Effect.LIGHT">
                      <span class="type-text text-ellipsis">{{ item.value.dataType }}</span>
                    </el-tooltip>
                    <el-icon :size="16" class="ml-1">
                      <arrow-down />
                    </el-icon>
                  </span>
                </template>
                <SMime @close="handleCloseMimeModel(item)" @select="handleSelectContentType($event, index)"></SMime>
              </el-popover>
            </div>
          </div>
        </div>
      </template>
      <template #tail>
        <div class="d-flex a-center">
          <div v-if="item.value.dataType === 'application/json' && 0" class="p-relative no-select flex0">
            <span class="cursor-pointer" @click.stop="showTemplateIndex = index">{{ t("应用模板") }}</span>
            <div v-if="showTemplateIndex === index" class="template-wrap">
              <div class="header">
                <el-input v-model="templateFilterString" :size="config.renderConfig.layout.size"
                  :placeholder="t('过滤模板')" :prefix-icon="Search" class="w-100" maxlength="100" clearable></el-input>
                <div class="flex0 theme-color cursor-pointer" @click="handleOpenTempateTab">{{ t("维护") }}</div>
              </div>
              <template v-if="jsonTemplateList.length > 0">
                <div v-for="(item2, index2) in jsonTemplateList" :key="index2" class="select-item"
                  @click="handleSelectTemplate(item2)">
                  <span class="head">
                    <SEllipsis :value="item2.name" :keyword="templateFilterString"></SEllipsis>
                  </span>
                  <span class="tail">{{ item2.creatorName }}</span>
                </div>
              </template>
              <div v-else class="select-item disabled d-flex j-center gray-500">{{ t("暂无数据") }}</div>
            </div>
          </div>
          <!-- <el-divider v-if="item.value.dataType === 'application/json'" direction="vertical"></el-divider> -->
          <div v-if="item.value.dataType === 'application/json' && 0" class="cursor-pointer flex0 mr-3"
            @click="handleOpenTemplateDialog(index)">{{ t("保存为模板") }} </div>
          <div v-if="index === 0" class="green cursor-pointer flex0" @click="handleAddResponse">{{ t("新增") }}</div>
          <div v-if="responseData.length > 1" class="red cursor-pointer ml-2" @click="handleDeleteResponse(index)">{{
            t("删除") }}
          </div>
        </div>
      </template>
      <!-- 内容展示 -->
      <div v-if="checkDisplayType(item.value.dataType) === 'json'" class="editor-wrap border-gray-400"
        :class="{ vertical: layout === 'vertical' }">
        <SJsonEditor ref="jsonComponents" :model-value="item.value.strJson"
          @update:modelValue="handleChangeResponseJson($event, index)"></SJsonEditor>
        <el-button type="primary" text class="format-btn" @click="handleFormat(index)">格式化</el-button>
      </div>
      <!-- 文本类型 -->
      <div v-else-if="checkDisplayType(item.value.dataType) === 'text'" class="editor-wrap"
        :class="{ vertical: layout === 'vertical' }">
        <SRawEditor :model-value="item.value.text" :type="item.value.dataType" class="editor"
          @update:modelValue="handleChangeTextValeu($event, index)">
        </SRawEditor>
      </div>
    </SCollapseCard>
    <ParamsTemplate v-model="paramsTemplatedialogVisible" :index="curentOperationIndex"></ParamsTemplate>
  </div>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import SCollapseCard from '@/components/common/collapse-card/g-collapse-card.vue'
import { computed, ref, Ref, onMounted, onUnmounted } from 'vue'
import { Effect } from 'element-plus';
import { Search, ArrowDown, Edit } from '@element-plus/icons-vue'
import type { ApidocResponseParams, ApidocResponseContentType, ApidocContentType } from '@src/types/global'
import { apidocCache } from '@/cache/apidoc'
import SStatus from './children/status.vue'
import SMime from './children/mime.vue'
import ParamsTemplate from './dialog/params-template/params-template.vue'
import useParamsTemplate from './compsables/params-template' //参数模板
import SEllipsis from '@/components/common/ellipsis-content/g-ellipsis-content.vue'
import SRawEditor from '@/components/apidoc/raw-editor/g-raw-editor.vue'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import { useApidoc } from '@/store/apidoc/apidoc';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { ApidocProjectParamsTemplate } from '@src/types/apidoc/base-info';
import { config } from '@src/config/config'

const apidocStroe = useApidoc();
const apidocBaseInfoStore = useApidocBaseInfo()
/*
|--------------------------------------------------------------------------
| 编辑操作
|--------------------------------------------------------------------------
*/
//当前编辑的节点
const currentEditNode: Ref<null | { title: string, _title: string, index: number }> = ref(null);
//所有输入框
const inputRefs: unknown[] = [];

//ref绑定
const bindRef = (el: unknown) => {
  if (el) {
    inputRefs.push(el);
  }
}
//确定修改title
const handleConfirmTitle = (_: ApidocResponseParams, index: number) => {
  if (currentEditNode.value && currentEditNode.value._title) {
    apidocStroe.changeResponseParamsTitleByIndex({
      index,
      title: currentEditNode.value._title,
    })
    currentEditNode.value = null;
  }
}
//取消编辑
const handleCancelEdit = () => {
  currentEditNode.value = null;
}
//改变当前编辑的节点
const handleChangeEditNode = (item: ApidocResponseParams, index: number) => {
  const value = {
    index,
    title: item.title,
    _title: item.title,
  };
  currentEditNode.value = value;
  setTimeout(() => {
    if (inputRefs[index]) {
      (inputRefs[index] as HTMLInputElement).focus();
    }
  })
}
//改变正在编辑的文本值
const handleChangeTextValeu = (value: string, index: number) => {
  apidocStroe.changeResponseParamsTextValueByIndex({
    index,
    value,
  })
}
/*
|--------------------------------------------------------------------------
| mock操作
|--------------------------------------------------------------------------
*/
//选择mock
const handleSelectMock = (index: number) => {
  apidocStroe.changeResponseMockByIndex(index);
}
/*
|--------------------------------------------------------------------------
| 状态修改、contentType修改、新增response、删除response
|--------------------------------------------------------------------------
|
*/
//新增一个response
const handleAddResponse = () => {
  apidocStroe.addResponseParam();
}
//删除一个response
const handleDeleteResponse = (index: number) => {
  apidocStroe.deleteResponseByIndex(index);
}
//response参数值
const responseData = computed(() => apidocStroe.apidoc.item.responseParams);
//布局
const layout = computed(() => apidocBaseInfoStore.layout);

/*
|--------------------------------------------------------------------------
| 状态码和返回类型相关
|--------------------------------------------------------------------------
*/
//是否显示状态码弹窗
const statusVisibleMap: Ref<Record<string, boolean>> = ref({});
const mimeVisibleMap: Ref<Record<string, boolean>> = ref({});
const closeStatusPopover = () => {
  Object.keys(mimeVisibleMap.value).forEach(key => {
    mimeVisibleMap.value[key] = false;
  })
}
const closeMimePopover = () => {
  Object.keys(statusVisibleMap.value).forEach(key => {
    statusVisibleMap.value[key] = false;
  })
}
//打开和关闭status弹窗
const toggleStatusModel = (item: ApidocResponseParams) => {
  statusVisibleMap.value[item._id!] = !statusVisibleMap.value[item._id!];
}
//关闭status弹窗
const handleCloseStatusModel = (item: ApidocResponseParams) => {
  statusVisibleMap.value[item._id!] = false;
}
//选择一个statusCode
const handleSelectStatusCode = (code: number, index: number) => {
  apidocStroe.changeResponseParamsCodeByIndex({
    index,
    code,
  })
}
//打开和关闭contentType弹窗
const toggleMimeModel = (item: ApidocResponseParams) => {
  mimeVisibleMap.value[item._id!] = !mimeVisibleMap.value[item._id!];
}
//关闭contentType弹窗
const handleCloseMimeModel = (item: ApidocResponseParams) => {
  mimeVisibleMap.value[item._id!] = false;
}
//选择一个contentType
const handleSelectContentType = (type: ApidocContentType, index: number) => {
  apidocStroe.changeResponseParamsDataTypeByIndex({
    index,
    type,
  })
}
//更改返回json数据
const handleChangeResponseJson = (value: string, index: number) => {
  apidocStroe.changeResponseStrJsonByIndex({
    index,
    value,
  })
}
onMounted(() => {
  document.documentElement.addEventListener('click', closeStatusPopover)
  document.documentElement.addEventListener('click', closeMimePopover)
})
onUnmounted(() => {
  document.documentElement.removeEventListener('click', closeStatusPopover)
  document.documentElement.removeEventListener('click', closeMimePopover)
})

/*
|--------------------------------------------------------------------------
| 不同类型数据展示
|--------------------------------------------------------------------------
*/
const checkDisplayType = (mimeType: ApidocResponseContentType): 'text' | 'json' | 'audio' | 'video' | 'image' | 'pdf' | 'download' | 'unknown' => {
  // 文本展示
  if (mimeType === 'text/csv' || mimeType === 'text/plain' || mimeType === 'text/html' || mimeType === 'application/xml' || mimeType === 'text/css' || mimeType === 'text/javascript') {
    return 'text';
  }
  // 图片展示
  if (mimeType === 'image/gif' || mimeType === 'image/jpeg' || mimeType === 'image/png' || mimeType === 'image/svg+xml') {
    return 'image';
  }
  // 音频文件
  if (mimeType === 'audio/webm' || mimeType === 'audio/ogg') {
    return 'audio';
  }
  // 视频文件
  if (mimeType === 'video/webm' || mimeType === 'video/ogg' || mimeType === 'application/ogg') {
    return 'video';
  }
  // 下载类型
  if (mimeType === 'application/octet-stream' || mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'download';
  }
  //=====================================特殊格式====================================//
  // PDF文件
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  //json格式
  if (mimeType === 'application/json') {
    return 'json';
  }
  return 'unknown'
}
/*
|--------------------------------------------------------------------------
| 模板相关操作
|--------------------------------------------------------------------------
*/
const { showTemplateIndex, templateFilterString, jsonTemplateList, paramsTemplatedialogVisible, curentOperationIndex, handleOpenTempateTab, handleOpenTemplateDialog } = useParamsTemplate();
//选择模板
const handleSelectTemplate = (templateInfo: ApidocProjectParamsTemplate) => {
  console.log(123, templateInfo.items)
}
/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/
const jsonComponents: Ref<null | {
  format: () => void,
}[]> = ref(null)
const handleFormat = (index: number) => {
  if (jsonComponents.value) {
    jsonComponents.value[index].format();
  }
}
const collapseState: Ref<Record<string, boolean>> = ref({});
const handleChangeCollapseState = (isShow: boolean, item: ApidocResponseParams) => {
  apidocCache.setResponseCollapseState(item._id || "", isShow);
}
onMounted(() => {
  collapseState.value = apidocCache.getAllResponseCollapseState();
})
</script>

<style lang='scss' scoped>
.response-params {
  .info-wrap {
    display: flex;
    height: 100%;
    align-items: center;

    .label {
      width: size(230);
    }

    .status-code {
      width: size(140);
    }

    .content-type {
      max-width: size(200);

      .type-text {
        max-width: size(200);
      }
    }

    .edit-title {
      border: 1px solid transparent;
    }

    .edit-input {
      border: 1px solid $gray-600;
      font-size: fz(14);
      height: size(20);
      line-height: size(20);
      width: size(120);

      &.error {
        border: 1px solid $red;
      }
    }

    .active {
      color: $theme-color;
    }
  }

  .edit-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    width: size(40);
    margin-top: size(2);

    &:hover {
      color: $theme-color;
    }
  }

  .editor-wrap {
    position: relative;
    height: size(350);

    &.vertical {
      height: size(250);
    }

    .editor {
      height: size(350);
    }

    .format-btn {
      position: absolute;
      right: size(10);
      top: size(0);
    }
  }

  .template-wrap {
    top: size(30);
    left: size(-200);
    background: $white;
    z-index: $zIndex-contextmenu;
    position: absolute;
    min-width: size(250);
    border: 1px solid $gray-200;
    box-shadow: rgb(0 0 0 / 10%) 0px 2px 8px 0px; //墨刀弹窗样式
    max-height: size(220);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: size(5);
    }

    &::-webkit-scrollbar-thumb {
      background: $gray-400;
    }

    .header {
      border-bottom: 1px solid $gray-300;
      display: flex;
      align-items: center;
      padding: size(3) size(20) size(3) size(5);
    }

    .el-input__inner {
      border: none;
      box-shadow: none;
    }

    .select-item {
      line-height: 1.8em;
      padding: size(5) size(25);
      cursor: pointer;
      display: flex;

      &:hover {
        background: $theme-color;
        color: $white;
      }

      &.active {
        background: $theme-color;
        color: $white;
      }

      &.disabled {
        background: inherit;
        color: inherit;
      }

      .head {
        margin-right: size(10);
      }

      .tail {
        margin-left: auto;
        // color: $gray-500;
      }
    }
  }
}
</style>
