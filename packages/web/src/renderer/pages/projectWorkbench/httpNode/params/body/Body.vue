<template>
  <div class="body-params">
    <div class="body-type d-flex a-center mb-1">
      <!-- body类型选择 -->
      <el-radio-group v-model="bodyType" @change="changeBodyType">
        <el-radio value="json">json</el-radio>
        <el-radio value="formdata">form-data</el-radio>
        <el-radio value="urlencoded">x-www-form-urlencoded</el-radio>
        <el-radio value="raw">raw</el-radio>
        <el-radio value="binary">binary</el-radio>
        <el-radio value="none">none</el-radio>
      </el-radio-group>
    </div>
    <div v-if="bodyType === 'json' || bodyType === 'formdata' || bodyType === 'urlencoded'" class="params-wrap" @click="handleFocus">
      <SJsonEditor v-show="bodyType === 'json'" ref="jsonComponent" manual-undo-redo :model-value="rawJsonData" :config="jsonEditorConfig"
        class="json-wrap" @ready="handleJsonEditorReady" @update:model-value="handleJsonChange" @undo="handleEditorUndo" @redo="handleEditorRedo"></SJsonEditor>
      <SParamsTree v-if="bodyType === 'formdata'" enable-file show-checkbox :data="formData"
        @change="handleFormdataChange"></SParamsTree>
      <SParamsTree v-if="bodyType === 'urlencoded'" show-checkbox :data="urlencodedData"
        @change="handleUrlencodedChange"></SParamsTree>
      <div v-show="bodyType === 'json'" class="body-op">
        <span class="btn" @click="handleFormat">格式化</span>
        <!-- <span class="btn" @click="handleOpenSaveDialog">保存用例</span>
                <span class="btn" @click="handleFormat">切换用例</span> -->
      </div>
      <div v-if="bodyType === 'json' && !rawJsonData && jsonBodyVisible" class="json-tip">
        <img class="w-100 h-100" :src="bodyTipUrl" draggable="false"
          oncontextmenu="return false" />
        <div class="no-tip" @click="handleHideTip">不再提示</div>
      </div>
    </div>
    <div v-else-if="bodyType === 'raw'" class="raw-wrap">
      <SJsonEditor
        ref="rawEditor"
        v-model="rawValue" 
        @change="handleChangeRawData"
        :config="{ fontSize: 13, language: rawType }">
      </SJsonEditor>
      <div class="raw-type">
        <el-select 
          v-model="rawType" 
          :size="config.renderConfig.layout.size" 
          class="w-100"
          @change="handleChangeRawType">
          <el-option label="text" value="text/plain"></el-option>
          <el-option label="html" value="text/html"></el-option>
          <el-option label="xml" value="application/xml"></el-option>
          <el-option label="javascript" value="text/javascript"></el-option>
        </el-select>
      </div>
    </div>
    <div v-else-if="bodyType === 'binary'" class="binary-wrap">
      <el-radio-group :model-value="requestBody?.binary?.mode" @update:model-value="handleChangeBinaryMode">
        <el-radio value="var">变量模式</el-radio>
        <el-radio value="file">文件模式</el-radio>
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
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, Ref } from 'vue'
import type { HttpNodeBodyMode, HttpNodeBodyParams, HttpNodeBodyRawType, HttpNodeContentType, ApidocProperty } from '@src/types'
import { useI18n } from 'vue-i18n'
import { userState } from '@/cache/userState/userStateCache'
import { useVariable } from '@/store/apidoc/variablesStore';
import { useHttpNode } from '@/store/apidoc/httpNodeStore';
import { config } from '@src/config/config';
import SJsonEditor from '@/components/common/jsonEditor/ClJsonEditor.vue'
import SParamsTree from '@/components/apidoc/paramsTree/ClParamsTree.vue'
import { Close } from '@element-plus/icons-vue'
import { convertTemplateValueToRealValue } from '@/helper';
import mime from 'mime';
import { useHttpRedoUndo } from '@/store/redoUndo/httpRedoUndoStore'
import { useApidocTas } from '@/store/apidoc/tabsStore'
import { router } from '@/router'
import { debounce, cloneDeep } from 'lodash-es'
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'

const bodyTipUrl = new URL('@/assets/imgs/apidoc/body-tip.png', import.meta.url).href
const rawEditor = ref<InstanceType<typeof SJsonEditor> | null>(null)
const httpNodeStore = useHttpNode()
const httpRedoUndoStore = useHttpRedoUndo()
const apidocTabsStore = useApidocTas()
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => {
  const tabs = apidocTabsStore.tabs[projectId];
  return tabs?.find((tab) => tab.selected) || null;
});
const jsonComponent: Ref<null | {
  format: () => void,
  focus: () => void,
  getCursorPosition?: () => Monaco.Position | null,
  setCursorPosition?: (position: Monaco.Position) => void,
}> = ref(null)
//根据参数内容校验对应的contentType值
const checkContentType = () => {
  const type = httpNodeStore.apidoc.item.requestBody.mode
  const { formdata, urlencoded, raw, rawJson, binary } = httpNodeStore.apidoc.item.requestBody;
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
  userState.setJsonBodyHintVisible(false);
  jsonBodyVisible.value = false;
}
//body类型
const bodyType = computed<HttpNodeBodyMode>({
  get() {
    return httpNodeStore.apidoc.item.requestBody.mode;
  },
  set(val) {
    httpNodeStore.changeBodyMode(val);
  },
});
const requestBody = computed<HttpNodeBodyParams>(() => {
  return httpNodeStore.apidoc.item.requestBody
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
const rawJsonData = computed<string>({
  get() {
    const { rawJson } = httpNodeStore.apidoc.item.requestBody;
    return rawJson;
  },
  set(val) {
    httpNodeStore.changeRawJson(val);
  }
})
//处理JSON内容变化
const handleJsonChange = (newValue: string) => {
  const oldValue = httpNodeStore.apidoc.item.requestBody.rawJson;
  httpNodeStore.changeRawJson(newValue);
  debouncedRecordJsonOperation(oldValue, newValue);
  checkContentType();
}
//处理编辑器undo
const handleEditorUndo = () => {
  const nodeId = currentSelectTab.value?._id;
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
  const nodeId = currentSelectTab.value?._id;
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
const urlencodedData = computed(() => httpNodeStore.apidoc.item.requestBody.urlencoded)
/*
|--------------------------------------------------------------------------
| raw类型数据处理
|--------------------------------------------------------------------------
*/
//raw类型
const rawType = computed<HttpNodeBodyRawType>({
  get() {
    return httpNodeStore.apidoc.item.requestBody.raw.dataType;
  },
  set(val) {
    httpNodeStore.changeBodyRawType(val)
  },
})
//raw类型数据值
const rawValue = computed({
  get() {
    return httpNodeStore.apidoc.item.requestBody.raw.data;
  },
  set(value: string) {
    httpNodeStore.changeBodyRawValue(value);
  },
})
//改变raw数据值
const handleChangeRawData = () => {
  checkContentType();
}
//切换raw参数类型
const handleChangeRawType = () => {
  const { raw } = httpNodeStore.apidoc.item.requestBody;
  if (!raw.data) {
    httpNodeStore.changeContentType('');
    return
  }
  rawEditor.value?.changeLanguage(raw.dataType);
  if (rawType.value === 'text/plain') {
    httpNodeStore.changeContentType('text/plain');
  } else if (rawType.value === 'text/html') {
    httpNodeStore.changeContentType('text/html');
  } else if (rawType.value === 'application/xml') {
    httpNodeStore.changeContentType('application/xml');
  } else if (rawType.value === 'text/javascript') {
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
const formData = computed(() => httpNodeStore.apidoc.item.requestBody.formdata)

// 处理 formdata 变化
const handleFormdataChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = {
    requestBody: cloneDeep(httpNodeStore.apidoc.item.requestBody),
    contentType: httpNodeStore.apidoc.item.contentType
  };
  httpNodeStore.apidoc.item.requestBody.formdata = newData as ApidocProperty<'string'>[];
  
  const newValue = {
    requestBody: cloneDeep(httpNodeStore.apidoc.item.requestBody),
    contentType: httpNodeStore.apidoc.item.contentType
  };
  debouncedRecordBodyOperation(oldValue, newValue);
  checkContentType();
};

// 处理 urlencoded 变化
const handleUrlencodedChange = (newData: ApidocProperty<'string' | 'file'>[]) => {
  const oldValue = {
    requestBody: cloneDeep(httpNodeStore.apidoc.item.requestBody),
    contentType: httpNodeStore.apidoc.item.contentType
  };
  httpNodeStore.apidoc.item.requestBody.urlencoded = newData as ApidocProperty<'string'>[];
  
  const newValue = {
    requestBody: cloneDeep(httpNodeStore.apidoc.item.requestBody),
    contentType: httpNodeStore.apidoc.item.contentType
  };
  debouncedRecordBodyOperation(oldValue, newValue);
  checkContentType();
};

/*
|--------------------------------------------------------------------------
| binary类型参数
|--------------------------------------------------------------------------
*/
const handleChangeBinaryMode = (binaryMode: string | number | boolean | undefined) => {
  httpNodeStore.handleChangeBinaryInfo({ mode: binaryMode as HttpNodeBodyParams['binary']['mode'] })
}
const handleChangeBinaryVarValue = (value: string) => {
  const { objectVariable } = useVariable()
  convertTemplateValueToRealValue(value, objectVariable).then(result => {
    const mimeType = mime.getType(result.split('\\').pop()) as HttpNodeContentType;
    httpNodeStore.changeContentType(mimeType || 'application/octet-stream')
  }).catch(error => {
    console.log(error)
  })
  httpNodeStore.handleChangeBinaryInfo({ varValue: value })
}
const handleSelectFile = (e: Event) => {
  const { files } = (e.target as HTMLInputElement);
  if (files?.length) {
    const file = files[0];
    const path = window.electronAPI?.fileManager.getFilePath(file) || "";
    httpNodeStore.handleChangeBinaryInfo({ 
      binaryValue: {
        path,
    }})
    const { objectVariable } = useVariable()
    convertTemplateValueToRealValue(path, objectVariable).then(result => {
    const mimeType = mime.getType(result.split('\\').pop()) as HttpNodeContentType;
    httpNodeStore.changeContentType(mimeType || 'application/octet-stream')
    }).catch(error => {
      console.log(error)
    })
  }
}
const handleClearSelectFile = () => {
  httpNodeStore.handleChangeBinaryInfo({ 
    binaryValue: {
      path: '',
    }
  })
  httpNodeStore.changeContentType('application/octet-stream');
}
/*
|--------------------------------------------------------------------------
| 生命周期相关
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  jsonBodyVisible.value = userState.getJsonBodyHintVisible();
});

// 防抖的JSON记录函数
const debouncedRecordJsonOperation = debounce((oldValue: string, newValue: string) => {
  if (!currentSelectTab.value || oldValue === newValue) return;
  
  const cursorPosition = jsonComponent.value?.getCursorPosition?.() || undefined;
  
  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "rawJsonOperation",
    operationName: "修改JSON Body",
    affectedModuleName: "rawJson",
    oldValue,
    newValue,
    cursorPosition,
    timestamp: Date.now()
  });
}, 300, { leading: true, trailing: true });

// 防抖的请求体记录函数
const debouncedRecordBodyOperation = debounce((oldValue: { requestBody: HttpNodeBodyParams, contentType: HttpNodeContentType }, newValue: { requestBody: HttpNodeBodyParams, contentType: HttpNodeContentType }) => {
  if (!currentSelectTab.value) return;

  httpRedoUndoStore.recordOperation({
    nodeId: currentSelectTab.value._id,
    type: "bodyOperation",
    operationName: "修改请求体",
    affectedModuleName: "requestBody",
    oldValue: cloneDeep(oldValue),
    newValue: cloneDeep(newValue),
    timestamp: Date.now()
  });
}, 300);

</script>

<style lang='scss' scoped>
.body-params {
  .body-type {
    margin-top: -10px;
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
