<template>
  <div class="s-download mr-2" @click.stop="downloadFile">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { request } from '@/api/api';
import { t } from 'i18next'

type DownloadResponse = {
  fileName?: string,
  data: string | Blob,
}

const props = defineProps({
  static: { //1.false 通过ajax下载文件流 2. true 通过url请求
    type: Boolean,
    default: false,
  },
  url: { //文件下载地址
    type: String,
    required: true,
    default: '',
  },
  params: { //额外参数
    type: Object,
    default: () => ({}),
  },
})
const emits = defineEmits(['finish', 'start']);

//导出任务明细
const downloadFile = () => {
  emits('start');
  if (props.static) {
    window.open(props.url);
    emits('finish');
    return;
  }
  request.get<DownloadResponse, DownloadResponse>(props.url, {
    responseType: 'blob',
    params: props.params,
  }).then((res) => {
    let blobUrl = '';
    blobUrl = URL.createObjectURL(res.data as Blob);
    const downloadElement = document.createElement('a');
    downloadElement.href = blobUrl;
    downloadElement.download = res.fileName ? decodeURIComponent(res.fileName) : t('未命名'); //下载后文件名
    document.body.appendChild(downloadElement);
    downloadElement.click(); //点击下载
    document.body.removeChild(downloadElement); //下载完成移除元素
    window.URL.revokeObjectURL(blobUrl); //释放掉blob对象
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    emits('finish');
  });
}
</script>

<style  scoped>
.s-download {
  &>button {
    height: 100%;
  }
}
</style>
