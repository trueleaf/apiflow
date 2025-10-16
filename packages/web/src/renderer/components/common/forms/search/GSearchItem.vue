
<template>
  <!-- 普通输入框 -->
  <SCol v-if="type === 'input'" v-bind="$attrs">
    <el-form-item :label="realLabel" :prop="prop">
      <SInput v-model:value="formInfo[prop]" :placeholder="realPlaceholder" @input="handleChange" @change="handleChange"></SInput>
    </el-form-item>
  </SCol>
  <!-- 下拉搜索框 -->
  <SCol v-if="type === 'select'" v-bind="$attrs">
    <el-form-item :label="realLabel" :prop="prop">
      <SSelect v-model:value="formInfo[prop]" v-bind="$attrs" :placeholder="realPlaceholder" @change="handleChange"></SSelect>
    </el-form-item>
  </SCol>
</template>

<script lang="ts" setup>
import SCol from "@/components/common/forms/col/GCol.vue"
import { computed, inject } from 'vue'
import SSelect from '@/components/common/forms/inputs/GSelect.vue'
import SInput from '@/components/common/forms/inputs/GInput.vue'

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
  }
})
const emits = defineEmits(['change'])
const formInfo =inject<Record<string, string | number>>('formInfo', {})
const realLabel = computed(() => {
  if (props.label.endsWith('：')) {
    return props.label;
  } if (props.label.endsWith(':')) {
    return props.label.replace(':', '：');
  }
  return `${props.label}：`;
})
const realPlaceholder = computed(() => props.placeholder ? props.placeholder : `请输入${props.label}`)
const handleChange = (value: string) => {
  emits('change', value);
}
</script>
