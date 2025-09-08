<template>
  <!-- 普通输入框 -->
  <SCol v-if="type === 'input'" v-bind="$attrs">
    <el-form-item :label="realLabel" :prop="prop">
      <SInput v-model:value="formInfo[prop]" focus :placeholder="realPlaceholder"></SInput>
    </el-form-item>
  </SCol>
  <!-- 下拉搜索框 -->
  <SCol v-if="type === 'select'" v-bind="$attrs">
    <el-form-item :label="realLabel" :prop="prop">
      <SSelect v-model:value="formInfo[prop]" v-bind="$attrs" :placeholder="realPlaceholder"></SSelect>
    </el-form-item>
  </SCol>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import SCol from '../col/g-col.vue'
import SInput from '../inputs/g-input.vue'
import SSelect from '../inputs/g-select.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'input',
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '',
  },
  prop: {
    type: [String],
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  maxLength: {
    type: Number,
    default: null,
  },
  minLength: {
    type: Number,
    default: null,
  },
  length: {
    type: Number,
    default: null,
  },
  phone: {
    type: Boolean,
    default: false,
  },
  focus: {
    type: Boolean,
    default: false,
  }
})
const formInfo = inject<Record<string, string>>('formInfo', {})
const realLabel = computed(() => {
  if (props.label.endsWith('：')) {
    return props.label;
  } if (props.label.endsWith(':')) {
    return props.label.replace(':', '：');
  }
  return `${props.label}：`;
});
const realPlaceholder = computed(() => props.placeholder ? props.placeholder : `请输入${props.label}`);
</script>
