<template>
  <div class="response-params">
    <SCollapseCard v-for="(item, index) in responseData" :key="index" :fold="collapseState[item._id || ''] === false"
      @change="handleChangeCollapseState($event, item)">
      <!-- 操作区域 -->
      <template #head>
        <div class="info-wrap">
          <div class="label">
            <div class="d-flex a-center">
              <span class="flex0">{{ t("名称") }}：</span>
              <span 
                v-if="(!currentEditNode || currentEditNode.index !== index)" 
                class="edit-title text-ellipsis"
                :title="item.title"
              >
                {{ item.title }}
              </span>
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
      <!-- 内容展示 -->
      <div v-if="checkDisplayType(item.value.dataType) === 'json'" class="editor-wrap border-gray-400"
        :class="{ vertical: layout === 'vertical' }">
        <SJsonEditor ref="jsonComponents" :model-value="item.value.strJson"
          @update:modelValue="handleChangeResponseJson($event, index)"></SJsonEditor>
        <el-button type="primary" text class="format-btn" @click="handleFormat(index)">{{ t('格式化') }}</el-button>
      </div>
      <!-- 文本类型 -->
      <div v-else-if="checkDisplayType(item.value.dataType) === 'text'" class="editor-wrap"
        :class="{ vertical: layout === 'vertical' }">
        <SRawEditor :model-value="item.value.text" :type="item.value.dataType" class="editor"
          @update:modelValue="handleChangeTextValeu($event, index)">
        </SRawEditor>
      </div>
    </SCollapseCard>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import SCollapseCard from '@/components/common/collapseCard/ClCollapseCard.vue'
import { computed, ref, Ref, onMounted, onUnmounted, watch } from 'vue'
import { Effect } from 'element-plus';
import { ArrowDown, Edit } from '@element-plus/icons-vue'
import type { HttpNodeResponseParams, HttpNodeResponseContentType, HttpNodeContentType } from '@src/types'
import { userState } from '@/cache/userState/userStateCache.ts'
import SStatus from './children/Status.vue'
import SMime from './children/Mime.vue'
import SRawEditor from '@/components/apidoc/rawEditor/ClRawEditor.vue'
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import { useApidoc } from '@/store/share/apidocStore';
import { useApidocBaseInfo } from '@/store/share/baseInfoStore';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/share/tabsStore'
import { router } from '@/router'
import { debounce, cloneDeep } from 'lodash-es'

const apidocStroe = useApidoc();
const apidocBaseInfoStore = useApidocBaseInfo()
const httpRedoUndoStore = useHttpRedoUndo()
const apidocTabsStore = useApidocTas()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => {
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
});
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
const handleConfirmTitle = (_: HttpNodeResponseParams, index: number) => {
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
const handleChangeEditNode = (item: HttpNodeResponseParams, index: number) => {
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
| 状态修改、contentType修改、新增response、删除response
|--------------------------------------------------------------------------
|
*/
// //新增一个response
// const handleAddResponse = () => {
//   apidocStroe.addResponseParam();
// }
// //删除一个response
// const handleDeleteResponse = (index: number) => {
//   apidocStroe.deleteResponseByIndex(index);
// }
//response参数值
const { t } = useI18n()

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
const toggleStatusModel = (item: HttpNodeResponseParams) => {
  statusVisibleMap.value[item._id!] = !statusVisibleMap.value[item._id!];
}
//关闭status弹窗
const handleCloseStatusModel = (item: HttpNodeResponseParams) => {
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
const toggleMimeModel = (item: HttpNodeResponseParams) => {
  mimeVisibleMap.value[item._id!] = !mimeVisibleMap.value[item._id!];
}
//关闭contentType弹窗
const handleCloseMimeModel = (item: HttpNodeResponseParams) => {
  mimeVisibleMap.value[item._id!] = false;
}
//选择一个contentType
const handleSelectContentType = (type: HttpNodeContentType, index: number) => {
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
const checkDisplayType = (mimeType: HttpNodeResponseContentType): 'text' | 'json' | 'audio' | 'video' | 'image' | 'pdf' | 'download' | 'unknown' => {
  // 文本展示
  if (mimeType === 'text/csv' || mimeType === 'text/plain' || mimeType === 'text/html' || mimeType === 'application/xml' || mimeType === 'text/css' || mimeType === 'text/javascript') {
    return 'text';
  }
  // 图片展示
  if (mimeType === 'image/jpeg' || mimeType === 'image/png' || mimeType === 'image/svg+xml') {
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
const handleChangeCollapseState = (isShow: boolean, item: HttpNodeResponseParams) => {
  userState.setHttpNodeResponseCollapseState(item._id || "", isShow);
}
onMounted(() => {
  collapseState.value = userState.getHttpNodeResponseCollapseState();
})

// 防抖的响应参数记录函数
const debouncedRecordResponseParamsOperation = debounce((oldValue: HttpNodeResponseParams[], newValue: HttpNodeResponseParams[]) => {
  if (!currentSelectTab.value) return;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "responseParamsOperation",
    operationName: "修改响应参数",
    affectedModuleName: "responseParams",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
}, 300);

// watch 监听 responseParams 变化
watch(() => responseData.value, (newVal, oldVal) => {
  if (oldVal && newVal) {
    debouncedRecordResponseParamsOperation(oldVal, newVal);
  }
}, {
  deep: true
});
</script>

<style lang='scss' scoped>
.response-params {
  .info-wrap {
    display: flex;
    height: 100%;
    align-items: center;

    .label {
      width: 230px;
    }

    .status-code {
      width: 140px;
    }

    .content-type {
      max-width: 200px;

      .type-text {
        max-width: 200px;
      }
    }

    .edit-title {
      border: 1px solid transparent;
    }

    .edit-input {
      border: 1px solid var(--gray-600);
      font-size: 14px;
      height: 20px;
      line-height: 20px;
      width: 120px;

      &.error {
        border: 1px solid var(--red);
      }
    }

    .active {
      color: var(--theme-color);
    }
  }

  .edit-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    width: 40px;
    margin-top: 2px;

    &:hover {
      color: var(--theme-color);
    }
  }

  .editor-wrap {
    position: relative;
    height: 350px;

    &.vertical {
      height: 250px;
    }

    .editor {
      height: 350px;
    }

    .format-btn {
      position: absolute;
      right: 10px;
      top: 0px;
    }
  }

  .template-wrap {
    top: 30px;
    left: -200px;
    background: var(--white);
    z-index: var(--zIndex-contextmenu);
    position: absolute;
    min-width: 250px;
    border: 1px solid var(--gray-200);
    box-shadow: rgb(0 0 0 / 10%) 0px 2px 8px 0px; //墨刀弹窗样式
    max-height: 220px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--gray-400);
    }

    .header {
      border-bottom: 1px solid var(--gray-300);
      display: flex;
      align-items: center;
      padding: 3px 20px 3px 5px;
    }

    .el-input__inner {
      border: none;
      box-shadow: none;
    }

    .select-item {
      line-height: 1.8em;
      padding: 5px 25px;
      cursor: pointer;
      display: flex;

      &:hover {
        background: var(--theme-color);
        color: var(--white);
      }

      &.active {
        background: var(--theme-color);
        color: var(--white);
      }

      &.disabled {
        background: inherit;
        color: inherit;
      }

      .head {
        margin-right: 10px;
      }

      .tail {
        margin-left: auto;
        // color: var(--gray-500);
      }
    }
  }
}
</style>

