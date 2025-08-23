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
      <SJsonEditor v-show="bodyType === 'json'" ref="jsonComponent" v-model="rawJsonData" :config="jsonEditorConfig"
        class="json-wrap" @ready="handleJsonEditorReady" @change="checkContentType"></SJsonEditor>
      <SParamsTree v-if="bodyType === 'formdata'" enable-file show-checkbox :data="formData"
        @change="checkContentType"></SParamsTree>
      <SParamsTree v-if="bodyType === 'urlencoded'" show-checkbox :data="urlencodedData"
        @change="checkContentType"></SParamsTree>
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
          :placeholder="t('输入变量；eg: {{ fileValue }}')" 
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
    <!-- <s-body-use-case-dialog v-model="bodyUseVisible"></s-body-use-case-dialog> -->
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, Ref } from 'vue'
import type { HttpNodeBodyMode, HttpNodeBodyParams, HttpNodeBodyRawType, HttpNodeContentType } from '@src/types'
import { useTranslation } from 'i18next-vue'
import { httpNodeCache } from '@/cache/httpNode'
import { useVariable } from '@/store/apidoc/variables';
import { useApidoc } from '@/store/apidoc/apidoc';
import { config } from '@src/config/config';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'
import { Close } from '@element-plus/icons-vue'
import { convertTemplateValueToRealValue } from '@/utils/utils';
import mime from 'mime';

// import { Switch } from '@element-plus/icons-vue'
// import sBodyUseCaseDialog from "./dialog/body-use-case/body-use-case.vue"

const bodyTipUrl = new URL('@/assets/imgs/apidoc/body-tip.png', import.meta.url).href
const rawEditor = ref<InstanceType<typeof SJsonEditor> | null>(null)
const apidocStore = useApidoc()
const jsonComponent: Ref<null | {
  format: () => void,
  focus: () => void,
}> = ref(null)
//根据参数内容校验对应的contentType值
const checkContentType = () => {
  const type = apidocStore.apidoc.item.requestBody.mode
  const { formdata, urlencoded, raw, rawJson, binary } = apidocStore.apidoc.item.requestBody;
  // const converJsonData = apidocConvertParamsToJsonData(json, true);
  const hasJsonData = rawJson?.length > 0;
  const hasFormData = formdata.filter(p => p.select).some((data) => data.key);
  const hasUrlencodedData = urlencoded.filter(p => p.select).some((data) => data.key);
  const hasBinaryVarValue = !!(binary.mode === 'var' && binary.varValue);
  const hasBinaryFileValue = !!(binary.mode === 'file' && binary.binaryValue.path);
  const hasBinaryData = hasBinaryVarValue || hasBinaryFileValue;
  const hasRawData = raw.data;
  if (type === 'raw' && hasRawData) {
    apidocStore.changeContentType(raw.dataType || 'text/plain');
  } else if (type === 'raw' && !hasRawData) {
    apidocStore.changeContentType('');
  } else if (type === 'none') {
    apidocStore.changeContentType('');
  } else if (type === 'urlencoded' && hasUrlencodedData) {
    apidocStore.changeContentType('application/x-www-form-urlencoded');
  } else if (type === 'urlencoded' && !hasUrlencodedData) {
    apidocStore.changeContentType('');
  } else if (type === 'json' && hasJsonData) {
    apidocStore.changeContentType('application/json');;
  } else if (type === 'json' && !hasJsonData) {
    apidocStore.changeContentType('');
  } else if (type === 'formdata' && hasFormData) {
    apidocStore.changeContentType('multipart/form-data');
  } else if (type === 'formdata' && !hasFormData) {
    apidocStore.changeContentType('');
  } else if (type === 'binary' && hasBinaryData) {
    apidocStore.changeContentType('application/octet-stream')
  }
}
//改变bodytype类型
const changeBodyType = () => {
  checkContentType();
  jsonComponent.value?.focus()
}
//不再显示body提示信息
const { t } = useTranslation()

const jsonBodyVisible = ref(false);
const handleHideTip = () => {
  httpNodeCache.hideJsonBodyTip();
  jsonBodyVisible.value = false;
}
//body类型
const bodyType = computed<HttpNodeBodyMode>({
  get() {
    return apidocStore.apidoc.item.requestBody.mode;
  },
  set(val) {
    apidocStore.changeBodyMode(val);
  },
});
const requestBody = computed<HttpNodeBodyParams>(() => {
  return apidocStore.apidoc.item.requestBody
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
    const { rawJson } = apidocStore.apidoc.item.requestBody;
    return rawJson;
  },
  set(val) {
    apidocStore.changeRawJson(val);
  }
})
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
const urlencodedData = computed(() => apidocStore.apidoc.item.requestBody.urlencoded)
/*
|--------------------------------------------------------------------------
| raw类型数据处理
|--------------------------------------------------------------------------
*/
//raw类型
const rawType = computed<HttpNodeBodyRawType>({
  get() {
    return apidocStore.apidoc.item.requestBody.raw.dataType;
  },
  set(val) {
    apidocStore.changeBodyRawType(val)
  },
})
//raw类型数据值
const rawValue = computed({
  get() {
    return apidocStore.apidoc.item.requestBody.raw.data;
  },
  set(value: string) {
    apidocStore.changeBodyRawValue(value);
  },
})
//改变raw数据值
const handleChangeRawData = () => {
  checkContentType();
}
//切换raw参数类型
const handleChangeRawType = () => {
  const { raw } = apidocStore.apidoc.item.requestBody;
  if (!raw.data) {
    apidocStore.changeContentType('');
    return
  }
  rawEditor.value?.changeLanguage(raw.dataType);
  if (rawType.value === 'text/plain') {
    apidocStore.changeContentType('text/plain');
  } else if (rawType.value === 'text/html') {
    apidocStore.changeContentType('text/html');
  } else if (rawType.value === 'application/xml') {
    apidocStore.changeContentType('application/xml');
  } else if (rawType.value === 'text/javascript') {
    apidocStore.changeContentType('text/javascript');
  } else if (rawType.value === 'application/json') {
    apidocStore.changeContentType('application/json');;
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
const formData = computed(() => apidocStore.apidoc.item.requestBody.formdata)
/*
|--------------------------------------------------------------------------
| binary类型参数
|--------------------------------------------------------------------------
*/
const handleChangeBinaryMode = (binaryMode: string | number | boolean | undefined) => {
  apidocStore.handleChangeBinaryInfo({ mode: binaryMode as HttpNodeBodyParams['binary']['mode'] })
}
const handleChangeBinaryVarValue = (value: string) => {
  const { objectVariable } = useVariable()
  convertTemplateValueToRealValue(value, objectVariable).then(result => {
    const mimeType = mime.getType(result.split('\\').pop()) as HttpNodeContentType;
    apidocStore.changeContentType(mimeType || 'application/octet-stream')
  }).catch(error => {
    console.log(error)
  })
  apidocStore.handleChangeBinaryInfo({ varValue: value })
}
const handleSelectFile = (e: Event) => {
  const { files } = (e.target as HTMLInputElement);
  if (files?.length) {
    const file = files[0];
    const path = window.electronAPI?.getFilePath(file) || "";
    apidocStore.handleChangeBinaryInfo({ 
      binaryValue: {
        path,
    }})
    const { objectVariable } = useVariable()
    convertTemplateValueToRealValue(path, objectVariable).then(result => {
    const mimeType = mime.getType(result.split('\\').pop()) as HttpNodeContentType;
    apidocStore.changeContentType(mimeType || 'application/octet-stream')
    }).catch(error => {
      console.log(error)
    })
  }
}
const handleClearSelectFile = () => {
  apidocStore.handleChangeBinaryInfo({ 
    binaryValue: {
      path: '',
    }
  })
  apidocStore.changeContentType('application/octet-stream');
}
/*
|--------------------------------------------------------------------------
| 生命周期相关
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  jsonBodyVisible.value = await httpNodeCache.getCouldShowJsonBodyTip();
});
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
      background: #ff9347;
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
    height: calc(100vh - 350px);

    .json-wrap {
      height: calc(100vh - 350px);
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
