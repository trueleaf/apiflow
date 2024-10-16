/*
模块名称：上传文件
备注：
*/
<template>
  <el-upload class="s-download-plain" :action="url" :http-request="upload" :show-file-list="false"
    :before-upload="checkFileSizeAndType">
    <slot />
  </el-upload>
</template>

<script lang="ts" setup>
import { axios } from '@/api/api';
import { PropType } from 'vue'
// import { UploadFile } from "element-plus/lib/components/upload/src/upload.type";


const props = defineProps({
  url: {
    type: String,
    default: '',
    required: true
  },
  size: {
    type: Number,
    default: 10
  },
  type: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  pdf: {
    type: Boolean,
    default: false,
  },
  excel: {
    type: Boolean,
    default: false,
  },
  word: {
    type: Boolean,
    default: false,
  },
  zip: {
    type: Boolean,
  },
  params: {
    type: Object,
    default: () => ({} as Record<string, unknown>)
  },
})
const emits = defineEmits(['start', 'finish', 'success']);

//上传文件
const upload = (file: { file: File }) => {
  emits('start');
  const formData = new FormData();
  formData.append('file', file.file);
  Object.keys(props.params).forEach((key) => {
    formData.append(key, props.params[key]);
  })
  let response: string;
  axios.post<{ data: string }, { data: string }>(props.url, formData).then((res) => {
    response = res.data;
    emits('success', response);
  }).catch((err) => {
    console.error(err);
  }).finally(() => {
    emits('finish', response);
  });
}
const checkFileSizeAndType = () => {
  // const isLtnM = file.size > 1024 * 1024 * size;
  // let isValidType = type.includes(file.type);
  // //=========================================================================//
  // if (pdf && file.type === "application/pdf") {
  //     isValidType = true;
  // }
  // if (excel && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith("xls") || file.name.endsWith("xlsx"))) {
  //     isValidType = true;
  // }
  // if (word && (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword")) {
  //     isValidType = true;
  // }
  // if (zip && file.type === "application/x-zip-compressed") {
  //     isValidType = true;
  // }
  // //=========================================================================//
  // if (isLtnM) {
  //     $message.warning(`每个文件大小限制为${size}M`);
  // } else if (!isValidType) {
  //     $message.warning("文件类型不正确");
  // }
  // return !isLtnM && isValidType;
}
</script>
