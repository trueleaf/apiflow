<template>
  <div class="body-params">
    <div class="body-type d-flex a-center mb-1">
      <!-- body类型选择 -->
      <el-radio-group v-model="bodyType" @change="changeBodyType">
        <el-radio value="json">json</el-radio>
        <el-radio value="formdata">form-data</el-radio>
        <el-radio value="urlencoded">x-www-form-urlencoded</el-radio>
        <el-radio value="raw">raw</el-radio>
        <el-radio value="none">none</el-radio>
      </el-radio-group>
    </div>
    <div v-if="bodyType !== 'raw'" class="params-wrap" @click="handleFocus">
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
    <div v-if="bodyType === 'raw'" class="raw">
      <SRawEditor v-model="rawValue" :type="rawType" @change="handleChangeRawData"></SRawEditor>
      <div class="raw-type">
        <el-select v-model="rawType" :size="config.renderConfig.layout.size" class="w-100"
          @change="handleChangeRawType">
          <el-option label="text" value="text/plain"></el-option>
          <el-option label="html" value="text/html"></el-option>
          <el-option label="xml" value="application/xml"></el-option>
          <el-option label="javascript" value="text/javascript"></el-option>
        </el-select>
      </div>
    </div>
    <!-- <s-body-use-case-dialog v-model="bodyUseVisible"></s-body-use-case-dialog> -->
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, Ref } from 'vue'
import type { ApidocBodyMode, ApidocBodyRawType } from '@src/types/global'
import { t } from 'i18next'
import { apidocCache } from '@/cache/apidoc'
import { useApidoc } from '@/store/apidoc/apidoc';
import { config } from '@src/config/config';
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
import SParamsTree from '@/components/apidoc/params-tree/g-params-tree.vue'
import SRawEditor from '@/components/apidoc/raw-editor/g-raw-editor.vue'

// import sBodyUseCaseDialog from "./dialog/body-use-case/body-use-case.vue"

const bodyTipUrl = new URL('@/assets/imgs/apidoc/body-tip.png', import.meta.url).href
const apidocStore = useApidoc()
const jsonComponent: Ref<null | {
  format: () => void,
  focus: () => void,
}> = ref(null)
//根据参数内容校验对应的contentType值
const checkContentType = () => {
  const type = apidocStore.apidoc.item.requestBody.mode
  const { formdata, urlencoded, raw, rawJson } = apidocStore.apidoc.item.requestBody;
  // const converJsonData = apidocConvertParamsToJsonData(json, true);
  const hasJsonData = rawJson?.length > 0;
  const hasFormData = formdata.filter(p => p.select).some((data) => data.key);
  const hasUrlencodedData = urlencoded.filter(p => p.select).some((data) => data.key);
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
  }
}
//改变bodytype类型
const changeBodyType = () => {
  checkContentType();
  jsonComponent.value?.focus()
}
//不再显示body提示信息
const jsonBodyVisible = ref(false);
const handleHideTip = () => {
  apidocCache.hideJsonBodyTip();
  jsonBodyVisible.value = false;
}
//body类型
const bodyType = computed<ApidocBodyMode>({
  get() {
    return apidocStore.apidoc.item.requestBody.mode;
  },
  set(val) {
    apidocStore.changeBodyMode(val);
  },
});

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
const rawType = computed<ApidocBodyRawType>({
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
| 生命周期相关
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  jsonBodyVisible.value = await apidocCache.getCouldShowJsonBodyTip();
});
</script>

<style lang='scss' scoped>
.body-params {
  .body-type {
    margin-top: size(-10);
  }

  .operation {
    margin-top: size(-3);
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
  }

  .raw {
    height: size(300);
    position: relative;

    .raw-type {
      position: absolute;
      right: size(0);
      bottom: size(20);
      width: size(100);
    }

    .tip {
      width: calc(100% - #{size(140)});
      height: size(20);
      display: flex;
      align-items: center;
      position: absolute;
      bottom: size(20);
      left: size(40);
      background: lighten($orange, 10%);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: $white;
      z-index: $zIndex-contextmenu;
    }
  }

  .params-wrap {
    border-top: 1px dashed $gray-400;
    position: relative;
    height: calc(100vh - #{size(350)});

    .json-wrap {
      height: calc(100vh - #{size(350)});
      // height: calc(100vh - #{size(350)});
    }

    .body-op {
      position: absolute;
      right: size(10);
      top: size(5);

      .btn {
        color: $theme-color;
        cursor: pointer;
        margin-right: size(10);
      }
    }

    .json-tip {
      width: size(576);
      height: size(194);
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      user-select: none;
      border: 1px solid $gray-400;

      &>img {
        opacity: 0.5;
      }

      .no-tip {
        position: absolute;
        right: size(5);
        bottom: size(5);
        cursor: pointer;
      }
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

      .el-input__inner {
        border: none;
      }
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
