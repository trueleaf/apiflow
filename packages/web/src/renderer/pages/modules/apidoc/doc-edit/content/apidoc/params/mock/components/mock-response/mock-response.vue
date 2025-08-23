<template>
  <div class="mock-response">
    <!-- 返回数据类型 -->
    <SLabelValue label="类型：" label-width="50px" class="mb-1" one-line>
      <el-radio-group v-model="responseType">
        <el-radio value="json" size="small">JSON</el-radio>
        <el-radio value="image" size="small">图片</el-radio>
        <el-radio value="file" size="small">文件</el-radio>
        <el-radio value="text" size="small">Text</el-radio>
        <el-radio value="customJson" size="small">自定义返回逻辑</el-radio>
      </el-radio-group>
    </SLabelValue>
    <div v-if="responseType === 'json'" class="editor-wrap">
      <SJsonEditor ref="jsonComponent" v-model="jsonValue"></SJsonEditor>
      <el-button class="mock" text @click.stop="showMockTip = !showMockTip">
        <el-popover :visible="showMockTip" placement="top-start" width="auto">
          <SMock auto-copy @select="handleSelectMockStr"></SMock>
          <template #reference>
            <span>Mock语法</span>
          </template>
        </el-popover>
      </el-button>
      <el-button type="primary" text class="format-btn" @click="handleFormat">格式化</el-button>
      <div v-if="isShowJsonTip" class="tip">
        <span>若不填写任何数据，mock结果会取返回参数数据，反之则会以填写数据作为mock结果</span>
        <span class="cursor-pointer d-flex a-center" @click="handleCloseTip">不再显示</span>
      </div>
    </div>
    <div v-if="responseType === 'image'" class="img-wrap">
      <SLabelValue label-width="50px" label="格式：" one-line>
        <el-radio-group v-model="imageType">
          <el-radio value="png" size="small">PNG</el-radio>
          <el-radio value="jpg" size="small">JPG/JPEG</el-radio>
          <el-radio value="gif" size="small">GIF</el-radio>
          <el-radio value="svg" size="small" disabled title="还未实现">SVG</el-radio>
        </el-radio-group>
      </SLabelValue>
      <SLabelValue label-width="100px" label="图片宽度：" width="40%">
        <el-input-number v-model="imageWidth" size="small" controls-position="right" :min="20" :max="9999"
          :step="10"></el-input-number>
      </SLabelValue>
      <SLabelValue label-width="150px" label="图片高度：" width="40%">
        <el-input-number v-model="imageHeight" size="small" controls-position="right" :min="20" :max="9999"
          :step="10"></el-input-number>
      </SLabelValue>
      <SLabelValue label-width="100px" label="文字大小：" width="40%">
        <el-input-number v-model="imageFontSize" size="small" controls-position="right" :min="12" :max="100"
          :step="1"></el-input-number>
      </SLabelValue>
      <SLabelValue label-width="150px" label="增大图片体积(KB)：" width="40%">
        <el-input-number v-model="imageSize" size="small" controls-position="right" :min="0" :step="100"
          :max="1024 * 1024 * 1024"></el-input-number>
      </SLabelValue>
      <SLabelValue label-width="100px" label="背景颜色：" width="30%">
        <el-color-picker v-model="imageBackgroundColor" />
      </SLabelValue>
      <SLabelValue label-width="100px" label="文字颜色：" width="30%">
        <el-color-picker v-model="imageTextColor" />
      </SLabelValue>
      <!-- <img :src="dataUrl" alt="mock图片" class="d-flex"> -->
      <div ref="image" class="image-demo"
        :style="{ backgroundColor: imageBackgroundColor, width: imageWidth + 'px', height: imageHeight + 'px' }">
        <div :style="{ color: imageTextColor, fontSize: imageFontSize + 'px' }">{{ imageWidth }} x {{ imageHeight }}</div>
        <div :style="{ color: imageTextColor, fontSize: imageFontSize / 1.2 + 'px' }">{{ formatBytes(realImageSize) }}
        </div>
      </div>
    </div>
    <div v-if="responseType === 'file'" class="download-wrap">
      <div class="item" :class="{ active: selectedType === 'doc' }" @click="selectedType = 'doc'">
        <svg class="svg-icon" aria-hidden="true">
          <use xlink:href="#iconWORD"></use>
        </svg>
        <div class="mt-1">DOC</div>
      </div>
      <div class="item" :class="{ active: selectedType === 'docx' }" @click="selectedType = 'docx'">
        <svg class="svg-icon" aria-hidden="true">
          <use xlink:href="#iconWORD"></use>
        </svg>
        <div class="mt-1">DOCX</div>
      </div>
      <div class="item" :class="{ active: selectedType === 'xls' }" @click="selectedType = 'xls'">
        <svg class="svg-icon" aria-hidden="true">
          <use xlink:href="#iconexcel"></use>
        </svg>
        <div class="mt-1">XLS</div>
      </div>
      <div class="item" :class="{ active: selectedType === 'xlsx' }" @click="selectedType = 'xlsx'">
        <svg class="svg-icon" aria-hidden="true">
          <use xlink:href="#iconexcel"></use>
        </svg>
        <div class="mt-1">XLSX</div>
      </div>
      <div class="item" :class="{ active: selectedType === 'pdf' }" @click="selectedType = 'pdf'">
        <svg class="svg-icon" aria-hidden="true">
          <use xlink:href="#iconpdfwenjian"></use>
        </svg>
        <div class="mt-1">PDF</div>
      </div>
      <div class="item" :class="{ active: selectedType === 'zip' }" @click="selectedType = 'zip'">
        <svg class="svg-icon" aria-hidden="true">
          <use xlink:href="#iconyasuobao"></use>
        </svg>
        <div class="mt-1">ZIP</div>
      </div>
      <div class="item" :class="{ active: selectedType === 'custom' }" @click="selectedType = 'custom'">
        <img src="@/assets/imgs/logo.png" alt="moyu" class="img">
        <div class="mt-1">自定义</div>
      </div>
    </div>
    <div v-if="responseType === 'text'" class="raw-editor-wrap">
      <!-- <SRawEditor v-model="rawText"></SRawEditor> -->
    </div>
    <div v-if="responseType === 'customJson'" class="editor-wrap">
      <SCustomEditor v-model="customResponseScript"></SCustomEditor>
    </div>
    <el-upload v-if="responseType === 'file' && selectedType === 'custom'" ref="uploadInstance" :auto-upload="false"
      class="mt-3" action="/" :limit="1" :on-exceed="handleExceed" :before-upload="handleCheckSize"
      @change="handleSelectFile">
      <template #trigger>
        <div>
          <el-button type="primary">选择文件</el-button>
        </div>
      </template>
      <template #tip>
        <div>若自定义文件大小超过20kb，则无法保存到服务端，并且只会在本地生效</div>
        <div>文件名称：{{ fileInfo.name }}</div>
        <div>文件大小：{{ formatBytes(fileInfo.size) }}</div>
        <div>文件路径：{{ filePath }}</div>
      </template>
      <template #file>&nbsp;</template>
    </el-upload>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, WatchStopHandle, Ref } from 'vue';
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
// import { genFileId, UploadInstance, UploadProps, UploadRawFile } from 'element-plus/lib/components/upload/src/upload';
import type { UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus/es/components';
import { genFileId } from 'element-plus';
import { formatBytes } from '@/helper/index'
import { HttpNode } from '@src/types';
import { httpNodeCache } from '@/cache/httpNode';
import SCustomEditor from './components/custom-editor.vue'
import SLabelValue from '@/components/common/label-value/g-label-value.vue'
import SJsonEditor from '@/components/common/json-editor/g-json-editor.vue'
// import SRawEditor from '@/components/apidoc/raw-editor/g-raw-editor.vue'
import { useApidoc } from '@/store/apidoc/apidoc';
import SMock from '@/components/apidoc/mock/g-mock.vue'


const apidocStroe = useApidoc()
/*
|--------------------------------------------------------------------------
| 返回数据类型
|--------------------------------------------------------------------------
*/
const responseType = computed<HttpNode['mockInfo']['responseType']>({
  get() {
    return apidocStroe.apidoc.mockInfo.responseType;
  },
  set(val) {
    apidocStroe.changeMockResponseType(val)
  },
})
/*
|--------------------------------------------------------------------------
| json数据类型
|--------------------------------------------------------------------------
*/
const isShowJsonTip = ref(httpNodeCache.getIsShowApidocMockParamsJsonTip());
const jsonValue = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.json;
  },
  set(val) {
    apidocStroe.changeMockJsonValue(val)
  },
})
//不再显示提示
const handleCloseTip = () => {
  httpNodeCache.setIsShowApidocMockParamsJsonTip(false);
  isShowJsonTip.value = false;
}
//是否显示mock提示
const showMockTip = ref(false)
//选中mock数据
const handleSelectMockStr = () => {
  showMockTip.value = false;
}
const jsonComponent: Ref<null | {
  format: () => void,
}> = ref(null)
//格式化数据
const handleFormat = () => {
  jsonComponent.value?.format();
}
/*
|--------------------------------------------------------------------------
| 图片相关
|--------------------------------------------------------------------------
*/
const image = ref<HTMLElement | null>(null);
// const dataUrl = ref("")
const realImageSize = ref(0);
const imageType = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.image.type;
  },
  set(val) {
    apidocStroe.changeMockImageType(val)
  },
})
const imageWidth = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.image.width;
  },
  set(val) {
    apidocStroe.changeMockImageWidth(val)
  },
})
const imageHeight = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.image.height;
  },
  set(val) {
    apidocStroe.changeMockImageHeight(val)
  },
})
const imageSize = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.image.size;
  },
  set(val) {
    apidocStroe.changeMockImageSize(val)
  },
})
const imageTextColor = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.image.color;
  },
  set(val) {
    apidocStroe.changeMockImageColor(val)
  },
})
const imageBackgroundColor = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.image.backgroundColor;
  },
  set(val) {
    apidocStroe.changeMockImageBackgroundColor(val)
  },
})
const imageFontSize = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.image.fontSize;
  },
  set(val) {
    apidocStroe.changeMockImageFontSize(val)
  },
})
/*
|--------------------------------------------------------------------------
| 文件相关
|--------------------------------------------------------------------------
*/
//选中的文件类型
const selectedType = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.file.type
  },
  set(type) {
    apidocStroe.changeMockFileType(type)
  }
})
const filePath = computed(() => apidocStroe.apidoc.mockInfo.file.filePath)
const fileInfo = ref({
  name: '',
  size: 0,
  type: '',
});
const uploadInstance = ref<UploadInstance>()
//选择文件
const handleSelectFile = async (file: UploadFile) => {
  apidocStroe.changeCustomFile((file.raw as File).name)
  fileInfo.value.name = file.name;
  fileInfo.value.size = file.size || 0;
}
//检查文件大小
const handleCheckSize: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size > 2 * 1024 * 10) {
    ElMessage.warning('超过20KB文件仅支持本地mock')
  }
  return true
}
//覆盖文件
const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadInstance.value?.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadInstance.value?.handleStart(file)
}
/*
|--------------------------------------------------------------------------
| raw类型文本数据
|--------------------------------------------------------------------------
*/
const rawText = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.text;
  },
  set(val) {
    apidocStroe.changeMockTextValue(val)
  }
})
/*
|--------------------------------------------------------------------------
| 自定义返回数据逻辑
|--------------------------------------------------------------------------
*/
const customResponseScript = computed({
  get() {
    return apidocStroe.apidoc.mockInfo.customResponseScript;
  },
  set(val) {
    apidocStroe.changeCustomResponseScript(val)
  }
})
const watchFlag = ref<WatchStopHandle | null>(null);
onMounted(() => {
  document.body.addEventListener('click', () => {
    showMockTip.value = false;
  })
  watchFlag.value = watch([imageWidth, imageHeight, imageTextColor, imageBackgroundColor, imageFontSize, imageSize], () => {
    realImageSize.value = imageSize.value * 1024
  }, {
    deep: true,
    immediate: true
  })
})
onBeforeUnmount(() => {
  if (watchFlag.value) {
    watchFlag.value();
  }
})

</script>

<style lang='scss' scoped>
.mock-response {
  .editor-wrap {
    height: calc(100vh - 610px);
    min-height: 200px;
    border: 1px solid var(--gray-500);
    display: flex;
    position: relative;

    .mock-json-editor {
      height: 100%;
      border-right: 1px solid var(--gray-500);
    }

    .tip {
      width: 100%;
      bottom: 0;
      height: 25px;
      display: flex;
      align-items: center;
      background-color: var(--orange);
      color: var(--white);
      position: absolute;
      text-indent: 1em;
    }

    .mock {
      position: absolute;
      top: 0;
      right: 70px;
      z-index: 1;
      background-color: var(--white);
      color: var(--theme-color);
      cursor: pointer;
    }

    .format-btn {
      position: absolute;
      right: 10px;
      top: 0;
    }
  }

  .raw-editor-wrap {
    height: calc(100vh - 610px);
    min-height: 200px;
  }

  .img-wrap {
    min-height: 200px;
  }

  .image-demo {
    // position: fixed;
    // left: -99999px;
    // top: -99999px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .download-wrap {
    display: flex;

    .item {
      width: 70px;
      height: 70px;
      padding: 10px;
      margin-right: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      border: 1px solid transparent;

      &.active {
        border: 1px solid var(--gray-400);
        box-shadow: var(--box-shadow-sm);
      }

      &:hover {
        border: 1px solid var(--gray-400);
      }

      .svg-icon {
        width: 40px;
        height: 40px;
      }

      .img {
        width: 28px;
        height: 28px;
      }
    }
  }
}
</style>
