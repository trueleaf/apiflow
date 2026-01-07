<template>
  <div class="body-params">
    <div class="body-type d-flex a-center mb-1">
      <!-- body类型选择 -->
      <div class="body-mode-list">
        <div
          v-for="mode in bodyModeOrder"
          :key="mode"
          :class="['body-mode-item', { active: bodyType === mode }]"
          @contextmenu.stop.prevent="(e: MouseEvent) => mode === 'formdata' || mode === 'urlencoded' ? handleContextmenu(e, mode) : undefined"
        >
          <el-radio :value="mode" v-model="bodyType" @change="changeBodyType">
            {{ getModeLabel(mode) }}
          </el-radio>
        </div>
      </div>
    </div>
    <div v-if="bodyType === 'json' || bodyType === 'formdata' || bodyType === 'urlencoded'" class="params-wrap" @click="handleFocus">
      <SJsonEditor v-show="bodyType === 'json'" ref="jsonComponent" manual-undo-redo :model-value="rawJsonData" :config="jsonEditorConfig"
        class="json-wrap" @ready="handleJsonEditorReady" @update:model-value="handleJsonChange" @undo="handleEditorUndo" @redo="handleEditorRedo"></SJsonEditor>
      <SParamsTree 
        v-if="bodyType === 'formdata'" 
        ref="formdataParamsTreeRef"
        enable-file 
        show-checkbox 
        :data="formData"
        :edit-mode="isFormdataMultiline ? 'multiline' : 'table'"
        @change="handleFormdataChange"
      ></SParamsTree>
      <SParamsTree 
        v-if="bodyType === 'urlencoded'" 
        ref="urlencodedParamsTreeRef"
        show-checkbox 
        :data="urlencodedData"
        :edit-mode="isUrlencodedMultiline ? 'multiline' : 'table'"
        @change="handleUrlencodedChange"
      ></SParamsTree>
      <div v-show="bodyType === 'json'" class="body-op">
        <span class="btn" @click="handleFormat">{{ t('格式化') }}</span>
        <!-- <span class="btn" @click="handleOpenSaveDialog">保存用例</span>
                <span class="btn" @click="handleFormat">切换用例</span> -->
      </div>
      <div v-if="bodyType === 'json' && !rawJsonData && jsonBodyVisible" class="json-tip">
        <img class="w-100 h-100" :src="bodyTipUrl" draggable="false"
          oncontextmenu="return false" />
        <div class="no-tip" @click="handleHideTip">{{ t('不再提示') }}</div>
      </div>
    </div>
    <div v-else-if="bodyType === 'raw'" class="raw-wrap">
      <SJsonEditor
        ref="rawEditor"
        manual-undo-redo
        :model-value="rawValue"
        :config="{ fontSize: 13, language: rawType }"
        @update:model-value="handleChangeRawData"
        @undo="handleRawEditorUndo"
        @redo="handleRawEditorRedo">
      </SJsonEditor>
      <div class="raw-type">
        <el-select
          data-testid="raw-body-type-select"
          :model-value="rawType"
          :size="config.renderConfig.layout.size"
          class="w-100"
          @update:model-value="handleChangeRawType">
          <el-option label="text" value="text/plain"></el-option>
          <el-option label="html" value="text/html"></el-option>
          <el-option label="xml" value="application/xml"></el-option>
          <el-option label="javascript" value="text/javascript"></el-option>
        </el-select>
      </div>
    </div>
    <div v-else-if="bodyType === 'binary'" class="binary-wrap">
      <el-radio-group :model-value="requestBody?.binary?.mode" @update:model-value="handleChangeBinaryMode">
        <el-radio value="var">{{ t('变量模式') }}</el-radio>
        <el-radio value="file">{{ t('文件模式') }}</el-radio>
      </el-radio-group>
      <div v-if="requestBody?.binary?.mode === 'var'" class="var-mode">
        <el-input
          :model-value="requestBody?.binary?.varValue" 
          :placeholder="t('输入变量；eg: ') + t('{0} fileValue {1}', ['{{', '}}'])" 
          class="w-20"
          @input="handleChangeBinaryVarValue">
        </el-input>
      </div>
      <div v-if="requestBody?.binary?.mode === 'file'" class="file-mode">
        <label v-if="!requestBody?.binary.binaryValue.path"  for="binaryValue" class="label w-20">{{ t("选择文件") }}</label>
        <input 
          id="binaryValue" 
          ref="fileInput" 
          class="d-none" 
          type="file"
          @change="handleSelectFile"
        ></input>
        <div class="d-flex a-center w-100">
          <div v-if="requestBody?.binary.binaryValue.path" :title="requestBody?.binary.binaryValue.path" class="path text-ellipsis">{{ requestBody?.binary.binaryValue.path }}</div>
          <el-icon v-if="requestBody?.binary.binaryValue.path" class="close" :size="16" @click="handleClearSelectFile">
            <Close />
          </el-icon>
        </div>
      </div>
    </div>
    <!-- 右键菜单 -->
    <teleport to="body">
      <SContextmenu 
        v-if="showContextmenu" 
        :left="contextmenuLeft" 
        :top="contextmenuTop"
      >
        <SContextmenuItem 
          :label="t('切换多行编辑模式')" 
          @click="handleToggleMultilineMode"
        ></SContextmenuItem>
      </SContextmenu>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted, onActivated, Ref, watch, defineAsyncComponent } from 'vue'
import type { HttpNodeBodyMode, HttpNodeBodyParams, HttpNodeBodyRawType, HttpNodeContentType, ApidocProperty } from '@src/types'
import { useI18n } from 'vue-i18n'
import { appStateCache } from '@/cache/appState/appStateCache'
import { useVariable } from '@/store/projectWorkbench/variablesStore';
import { useHttpNode } from '@/store/httpNode/httpNodeStore';
import { config } from '@src/config/config';
import SParamsTree from '@/components/apidoc/paramsTree/ClParamsTree.vue'
import SContextmenu from '@/components/common/contextmenu/ClContextmenu.vue'
import SContextmenuItem from '@/components/common/contextmenu/ClContextmenuItem.vue'
import { Close } from '@element-plus/icons-vue'
import { getCompiledTemplate } from '@/helper';
import mime from 'mime';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useProjectNav } from '@/store/projectWorkbench/projectNavStore'
import { router } from '@/router'
import { cloneDeep } from 'lodash-es'
import type * as Monaco from 'monaco-editor'
import { bodyModeOrderCache } from '@/cache/httpNode/bodyModeOrderCache'
import { cacheKey } from '@/cache/cacheKey'

const SJsonEditor = defineAsyncComponent(() => import('@/components/common/jsonEditor/ClJsonEditor.vue'))

const bodyTipUrl = new URL('@/assets/imgs/apidoc/body-tip.png', import.meta.url).href
const rawEditor = ref<{
  changeLanguage: (lang: string) => void,
  getCursorPosition?: () => Monaco.Position | null,
  setCursorPosition?: (position: Monaco.Position) => void,
} | null>(null)
const httpNodeStore = useHttpNode()
const httpRedoUndoStore = useHttpRedoUndo()
const projectNavStore = useProjectNav()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectNav = computed(() => {
  const navs = projectNavStore.navs[projectId];
  return navs?.find((nav) => nav.selected) || null;
});
const jsonComponent: Ref<null | {
  format: () => void,
  focus: () => void,
  getCursorPosition?: () => Monaco.Position | null,
  setCursorPosition?: (position: Monaco.Position) => void,
}> = ref(null)

//根据参数内容校验对应的contentType值
const checkContentType = () => {
  const type = httpNodeStore.httpNodeInfo.item.requestBody.mode
  const { formdata, urlencoded, raw, rawJson, binary } = httpNodeStore.httpNodeInfo.item.requestBody;
  // const converJsonData = apidocConvertParamsToJsonData(json, true);
  const hasJsonData = rawJson?.length > 0;
  const hasFormData = formdata.filter(p => p.select).some((data) => data.key);
  const hasUrlencodedData = urlencoded.filter(p => p.select).some((data) => data.key);
  const hasBinaryVarValue = !!(binary.mode === 'var' && binary.varValue);
  const hasBinaryFileValue = !!(binary.mode === 'file' && binary.binaryValue.path);
  const hasBinaryData = hasBinaryVarValue || hasBinaryFileValue;
  const hasRawData = raw.data;
  if (type === 'raw' && hasRawData) {
    httpNodeStore.changeContentType(raw.dataType || 'text/plain');
  } else if (type === 'raw' && !hasRawData) {
    httpNodeStore.changeContentType('');
  } else if (type === 'none') {
    httpNodeStore.changeContentType('');
  } else if (type === 'urlencoded' && hasUrlencodedData) {
    httpNodeStore.changeContentType('application/x-www-form-urlencoded');
  } else if (type === 'urlencoded' && !hasUrlencodedData) {
    httpNodeStore.changeContentType('');
  } else if (type === 'json' && hasJsonData) {
    httpNodeStore.changeContentType('application/json');;
  } else if (type === 'json' && !hasJsonData) {
    httpNodeStore.changeContentType('');
  } else if (type === 'formdata' && hasFormData) {
    httpNodeStore.changeContentType('multipart/form-data');
  } else if (type === 'formdata' && !hasFormData) {
    httpNodeStore.changeContentType('');
  } else if (type === 'binary' && hasBinaryData) {
    httpNodeStore.changeContentType('application/octet-stream')
  }
}
//改变bodytype类型
const changeBodyType = () => {
  checkContentType();
  jsonComponent.value?.focus()
}
//不再显示body提示信息
const { t } = useI18n()

const jsonBodyVisible = ref(false);
const handleHideTip = () => {
  appStateCache.setJsonBodyHintVisible(false);
  jsonBodyVisible.value = false;
}
//body类型
const bodyType = computed<HttpNodeBodyMode>({
  get() {
    return httpNodeStore.httpNodeInfo.item.requestBody.mode;
  },
  set(val) {
    httpNodeStore.changeBodyMode(val);
  },
});
const requestBody = computed<HttpNodeBodyParams>(() => {
  return httpNodeStore.httpNodeInfo.item.requestBody
})
/*
|--------------------------------------------------------------------------
| json类型操作
|--------------------------------------------------------------------------
*/
// const bodyUseVisible = ref(false); //保存用例弹窗
// //打开用例弹窗
// const handleOpenSaveDialog = () => {
//     bodyUseVisible.value = true
// }
//json格式body参数
const rawJsonData = computed({
  get() {
    const { rawJson } = httpNodeStore.httpNodeInfo.item.requestBody;
    return rawJson;
  },
  set(val) {
    httpNodeStore.changeRawJson(val);
  }
})
//处理JSON内容变化
const handleJsonChange = (newValue: string) => {
  const oldValue = httpNodeStore.httpNodeInfo.item.requestBody.rawJson;
  httpNodeStore.changeRawJson(newValue);
  recordJsonOperation(oldValue, newValue);
  checkContentType();
}
//处理编辑器undo
const handleEditorUndo = () => {
  const nodeId = currentSelectNav.value?._id;
  if (nodeId) {
    const result = httpRedoUndoStore.httpUndo(nodeId);
    if (result.code === 0 && result.operation?.type === 'rawJsonOperation') {
      if (result.operation.cursorPosition) {
        jsonComponent.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//处理编辑器redo
const handleEditorRedo = () => {
  const nodeId = currentSelectNav.value?._id;
  if (nodeId) {
    const result = httpRedoUndoStore.httpRedo(nodeId);
    if (result.code === 0 && result.operation?.type === 'rawJsonOperation') {
      if (result.operation.cursorPosition) {
        jsonComponent.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//格式化json
const handleFormat = () => {
  jsonComponent.value?.format()
}
const handleFocus = () => {
  jsonComponent.value?.focus()
}
const jsonEditorConfig = ref({
})
const handleJsonEditorReady = () => {
  jsonComponent.value?.focus()
}
/*
|--------------------------------------------------------------------------
| x-www-form-urlencoded类型操作
|--------------------------------------------------------------------------
*/
const urlencodedData = computed(() => httpNodeStore.httpNodeInfo.item.requestBody.urlencoded)
/*
|--------------------------------------------------------------------------
| raw类型数据处理
|--------------------------------------------------------------------------
*/
//raw类型
const rawType = computed<HttpNodeBodyRawType>(() => httpNodeStore.httpNodeInfo.item.requestBody.raw.dataType)
//raw类型数据值
const rawValue = computed(() => httpNodeStore.httpNodeInfo.item.requestBody.raw.data)
//改变raw数据值
const handleChangeRawData = (newData: string) => {
  const oldValue = {
    data: httpNodeStore.httpNodeInfo.item.requestBody.raw.data,
    dataType: httpNodeStore.httpNodeInfo.item.requestBody.raw.dataType
  };
  httpNodeStore.changeBodyRawValue(newData);
  const newValue = {
    data: newData,
    dataType: httpNodeStore.httpNodeInfo.item.requestBody.raw.dataType
  };
  recordRawDataOperation(oldValue, newValue);
  checkContentType();
}
//处理raw编辑器undo
const handleRawEditorUndo = () => {
  const nodeId = currentSelectNav.value?._id;
  if (nodeId) {
    const result = httpRedoUndoStore.httpUndo(nodeId);
    if (result.code === 0 && result.operation?.type === 'rawDataOperation') {
      if (result.operation.cursorPosition) {
        rawEditor.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//处理raw编辑器redo
const handleRawEditorRedo = () => {
  const nodeId = currentSelectNav.value?._id;
  if (nodeId) {
    const result = httpRedoUndoStore.httpRedo(nodeId);
    if (result.code === 0 && result.operation?.type === 'rawDataOperation') {
      if (result.operation.cursorPosition) {
        rawEditor.value?.setCursorPosition?.(result.operation.cursorPosition);
      }
    }
  }
}
//切换raw参数类型
const handleChangeRawType = (newType: HttpNodeBodyRawType) => {
  const { raw } = httpNodeStore.httpNodeInfo.item.requestBody;
  const oldValue = {
    data: raw.data,
    dataType: raw.dataType
  };
  httpNodeStore.changeBodyRawType(newType);
  const newValue = {
    data: raw.data,
    dataType: newType
  };
  recordRawDataOperation(oldValue, newValue);
  if (!raw.data) {
    httpNodeStore.changeContentType('');
    return
  }
  rawEditor.value?.changeLanguage(newType);
  if (newType === 'text/plain') {
    httpNodeStore.changeContentType('text/plain');
  } else if (newType === 'text/html') {
    httpNodeStore.changeContentType('text/html');
  } else if (newType === 'application/xml') {
    httpNodeStore.changeContentType('application/xml');
  } else if (newType === 'text/javascript') {
    httpNodeStore.changeContentType('text/javascript');
  } else {
    console.warn(t('未知请求类型'));
  }
}

/*
|--------------------------------------------------------------------------
| formdata数据处理
|--------------------------------------------------------------------------
*/
//formData格式body参数
const formData = computed(() => httpNodeStore.httpNodeInfo.item.requestBody.formdata)

// 处理 formdata 变化
const handleFormdataChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  httpNodeStore.httpNodeInfo.item.requestBody.formdata = JSON.parse(JSON.stringify(newData)) as ApidocProperty<'string'>[];
  
  const newValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  recordBodyOperation(oldValue, newValue);
  checkContentType();
};

// 处理 urlencoded 变化
const handleUrlencodedChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  httpNodeStore.httpNodeInfo.item.requestBody.urlencoded = cloneDeep(newData) as ApidocProperty<'string'>[];

  const newValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  recordBodyOperation(oldValue, newValue);
  checkContentType();
};

/*
|--------------------------------------------------------------------------
| binary类型参数
|--------------------------------------------------------------------------
*/
const handleChangeBinaryMode = (binaryMode: string | number | boolean | undefined) => {
  const oldValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  httpNodeStore.handleChangeBinaryInfo({ mode: binaryMode as HttpNodeBodyParams['binary']['mode'] });
  const newValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  recordBodyOperation(oldValue, newValue);
}
const handleChangeBinaryVarValue = (value: string) => {
  const oldValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  const { variables } = useVariable()
  getCompiledTemplate(value, variables).then(result => {
    const mimeType = mime.getType(result.split('\\').pop()) as HttpNodeContentType;
    httpNodeStore.changeContentType(mimeType || 'application/octet-stream')
  }).catch(error => {
    console.warn(error)
  })
  httpNodeStore.handleChangeBinaryInfo({ varValue: value });
  const newValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  recordBodyOperation(oldValue, newValue);
}
const handleSelectFile = (e: Event) => {
  const { files } = (e.target as HTMLInputElement);
  if (files?.length) {
    const oldValue = {
      requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
      contentType: httpNodeStore.httpNodeInfo.item.contentType
    };
    const file = files[0];
    const path = window.electronAPI?.fileManager.getFilePath(file) || "";
    httpNodeStore.handleChangeBinaryInfo({
      binaryValue: {
        path,
    }})
    const { variables } = useVariable()
    getCompiledTemplate(path, variables).then(result => {
    const mimeType = mime.getType(result.split('\\').pop()) as HttpNodeContentType;
    httpNodeStore.changeContentType(mimeType || 'application/octet-stream')
    }).catch(error => {
      console.warn(error)
    })
    const newValue = {
      requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
      contentType: httpNodeStore.httpNodeInfo.item.contentType
    };
    recordBodyOperation(oldValue, newValue);
  }
}
const handleClearSelectFile = () => {
  const oldValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  httpNodeStore.handleChangeBinaryInfo({
    binaryValue: {
      path: '',
    }
  })
  httpNodeStore.changeContentType('application/octet-stream');
  const newValue = {
    requestBody: cloneDeep(httpNodeStore.httpNodeInfo.item.requestBody),
    contentType: httpNodeStore.httpNodeInfo.item.contentType
  };
  recordBodyOperation(oldValue, newValue);
}
/*
|--------------------------------------------------------------------------
| Body Mode 顺序
|--------------------------------------------------------------------------
*/
const bodyModeOrder = ref<HttpNodeBodyMode[]>(bodyModeOrderCache.getBodyModeOrder())
// 获取 Mode 显示标签
const getModeLabel = (mode: HttpNodeBodyMode): string => {
  const labels: Record<HttpNodeBodyMode, string> = {
    json: 'json',
    formdata: 'form-data',
    urlencoded: 'x-www-form-urlencoded',
    raw: 'raw',
    binary: 'binary',
    none: 'none',
  }
  return labels[mode]
}
// 监听全局配置变化
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === cacheKey.settings.httpNode.bodyModeOrder) {
    bodyModeOrder.value = bodyModeOrderCache.getBodyModeOrder()
  }
}
/*
|--------------------------------------------------------------------------
| 右键菜单和多行编辑模式
|--------------------------------------------------------------------------
*/
type ParamsTreeInstance = InstanceType<typeof SParamsTree> & {
  onMultilineApplied?: (handler: () => void) => void
  onMultilineCancelled?: (handler: () => void) => void
}
const formdataParamsTreeRef = ref<ParamsTreeInstance | null>(null)
const urlencodedParamsTreeRef = ref<ParamsTreeInstance | null>(null)
const showContextmenu = ref(false)
const contextmenuLeft = ref(0)
const contextmenuTop = ref(0)
const contextmenuBodyType = ref<'formdata' | 'urlencoded' | null>(null)
const isFormdataMultiline = ref(false)
const isUrlencodedMultiline = ref(false)
//处理右键菜单
const handleContextmenu = (e: MouseEvent, type: 'formdata' | 'urlencoded') => {
  contextmenuBodyType.value = type
  contextmenuLeft.value = e.clientX
  contextmenuTop.value = e.clientY
  showContextmenu.value = true
}
//切换多行编辑模式
const handleToggleMultilineMode = () => {
  if (contextmenuBodyType.value === 'formdata') {
    isFormdataMultiline.value = !isFormdataMultiline.value
  } else if (contextmenuBodyType.value === 'urlencoded') {
    isUrlencodedMultiline.value = !isUrlencodedMultiline.value
  }
  showContextmenu.value = false
}
//多行应用完成后返回表格模式
const handleFormdataMultilineApplied = () => {
  isFormdataMultiline.value = false
}
const handleUrlencodedMultilineApplied = () => {
  isUrlencodedMultiline.value = false
}
//多行取消后返回表格模式
const handleFormdataMultilineCancelled = () => {
  isFormdataMultiline.value = false
}
const handleUrlencodedMultilineCancelled = () => {
  isUrlencodedMultiline.value = false
}
//全局点击隐藏菜单
const bindGlobalClick = () => {
  showContextmenu.value = false
}
//注册多行应用完成回调
watch(formdataParamsTreeRef, (instance) => {
  if (!instance?.onMultilineApplied) return
  instance.onMultilineApplied(handleFormdataMultilineApplied)
  if (!instance?.onMultilineCancelled) return
  instance.onMultilineCancelled(handleFormdataMultilineCancelled)
})
watch(urlencodedParamsTreeRef, (instance) => {
  if (!instance?.onMultilineApplied) return
  instance.onMultilineApplied(handleUrlencodedMultilineApplied)
  if (!instance?.onMultilineCancelled) return
  instance.onMultilineCancelled(handleUrlencodedMultilineCancelled)
})
/*
|--------------------------------------------------------------------------
| 生命周期相关
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  jsonBodyVisible.value = appStateCache.getJsonBodyHintVisible();
  document.body.addEventListener('click', bindGlobalClick);
  window.addEventListener('storage', handleStorageChange);
});
onActivated(() => {
  bodyModeOrder.value = bodyModeOrderCache.getBodyModeOrder()
})
onUnmounted(() => {
  document.body.removeEventListener('click', bindGlobalClick);
  window.removeEventListener('storage', handleStorageChange);
});

//JSON记录函数
const recordJsonOperation = (oldValue: string, newValue: string) => {
  if (!currentSelectNav.value || oldValue === newValue) return;

  const cursorPosition = jsonComponent.value?.getCursorPosition?.() || undefined;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectNav.value._id,
    type: "rawJsonOperation",
    operationName: "修改JSON Body",
    affectedModuleName: "rawJson",
    oldValue,
    newValue,
    cursorPosition,
    timestamp: Date.now()
  });
};
//请求体记录函数
const recordBodyOperation = (oldValue: { requestBody: HttpNodeBodyParams, contentType: HttpNodeContentType }, newValue: { requestBody: HttpNodeBodyParams, contentType: HttpNodeContentType }) => {
  if (!currentSelectNav.value) return;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectNav.value._id,
    type: "bodyOperation",
    operationName: "修改请求体",
    affectedModuleName: "requestBody",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
};
//Raw数据记录函数
const recordRawDataOperation = (oldValue: { data: string; dataType: string }, newValue: { data: string; dataType: string }) => {
  if (!currentSelectNav.value || (oldValue.data === newValue.data && oldValue.dataType === newValue.dataType)) return;

  const cursorPosition = rawEditor.value?.getCursorPosition?.() || undefined;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectNav.value._id,
    type: "rawDataOperation",
    operationName: "修改Raw Body",
    affectedModuleName: "rawData",
    oldValue,
    newValue,
    cursorPosition,
    timestamp: Date.now()
  });
};

</script>

<style lang='scss' scoped>
.body-params {
  .body-type {
    margin-top: -10px;
  }
  .body-mode-list {
    height: 34px;
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .body-mode-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    &.active {
      background-color: var(--theme-color-light);
    }
  }

  .operation {
    margin-top: -3px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
  }

  .raw-wrap {
    height: 300px;
    position: relative;
    height: calc(100vh - 350px);
    border: 1px solid var(--gray-300);
    .raw-type {
      position: absolute;
      right: 0px;
      bottom: 0px;
      width: 100px;
    }
    .tip {
      width: calc(100% - 140px);
      height: 20px;
      display: flex;
      align-items: center;
      position: absolute;
      bottom: 20px;
      left: 40px;
      background: var(--orange);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--white);
      z-index: var(--zIndex-contextmenu);
    }
  }

  .params-wrap {
    border-top: 1px dashed var(--gray-400);
    position: relative;
    height: calc(100vh - 300px);

    .json-wrap {
      height: calc(100vh - 300px);
    }

    .body-op {
      position: absolute;
      right: 10px;
      top: 5px;

      .btn {
        color: var(--theme-color);
        cursor: pointer;
        margin-right: 10px;
      }
    }

    .json-tip {
      width: 576px;
      height: 194px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      user-select: none;
      border: 1px solid var(--gray-400);

      &>img {
        opacity: 0.5;
      }

      .no-tip {
        position: absolute;
        right: 5px;
        bottom: 5px;
        cursor: pointer;
      }
    }
  }
  .json-tip img {
    pointer-events: none;
  }
  .binary-wrap {
    border-top: 1px dashed var(--gray-400);
    position: relative;
    height: calc(100vh - 350px);
 
    .var-mode {
      padding: 5px 5px;
      height: 30px;
      display: flex;
      align-items: center;
      margin-top: 10px;
    }
    .file-mode {
      padding: 5px 5px;
      height: 30px;
      display: flex;
      align-items: center;
      margin-top: 10px;
      .label {
        padding: 5px 5px;
        height: 30px;
        cursor: pointer;
        background-color: var(--gray-300);
      }
      .path {
        max-width: 75%;
        padding: 3px 5px;
        border: 1px dashed var(--gray-400);
      }
      .close {
        font-size: 16px;
        cursor: pointer;
        &:hover {
          color: var(--red);
        }
      }
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
    box-shadow: var(--box-shadow-sm);
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

      .el-input__inner {
        border: none;
      }
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

      .head {
        margin-right: 10px;
      }

      .tail {
        margin-left: auto;
        // color: $gray-500;
      }
    }
  }
}
</style>
