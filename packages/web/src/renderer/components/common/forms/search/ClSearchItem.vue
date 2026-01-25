
<template>
  <!-- 普通输入框 -->
  <el-col v-if="type === 'input'" v-bind="$attrs" :xs="24" :sm="24" :md="md" :lg="lg" :xl="xl">
    <el-form-item :label="realLabel" :prop="prop">
      <SInput v-model:value="formInfo[prop]" :placeholder="realPlaceholder" @input="handleChange" @change="handleChange"></SInput>
    </el-form-item>
  </el-col>
  <!-- 下拉搜索框 -->
  <el-col v-if="type === 'select'" v-bind="$attrs" :xs="24" :sm="24" :md="md" :lg="lg" :xl="xl">
    <el-form-item :label="realLabel" :prop="prop">
      <SSelect v-model:value="formInfo[prop]" v-bind="$attrs" :placeholder="realPlaceholder" @change="handleChange"></SSelect>
    </el-form-item>
  </el-col>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import SSelect from '@/components/common/forms/inputs/ClSelect.vue'
import SInput from '@/components/common/forms/inputs/ClInput.vue'

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
  oneLine: {
    type: Boolean,
    default: false,
  },
  halfLine: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['change'])
const formInfo =inject<Record<string, string | number>>('formInfo', {})
const md = computed(() => {
  if (props.oneLine) {
    return 24;
  }
  if (props.halfLine) {
    return 12;
  }
  return 12;
})
const lg = computed(() => {
  if (props.oneLine) {
    return 24;
  }
  return undefined;
})
const xl = computed(() => {
  if (props.oneLine) {
    return 24;
  }
  return undefined;
})
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
