<template>
  <el-input ref="ipt" v-bind="$attrs" :model-value="value" :placeholder="placeholder" :maxlength="9999"
    :size="config.renderConfig.layout.size" :class="className" clearable @update:modelValue="handleInput">
  </el-input>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { config } from '@/../config/config'

const props = defineProps({
  value: {
    type: [String, Number],
    default: '',
  },
  className: {
    type: String,
    default: 'w-100',
  },
  placeholder: {
    type: String,
    default: '',
  },
  focus: {
    type: Boolean,
    default: false,
  },
})
const ipt = ref<HTMLInputElement>()
const emits = defineEmits(['update:value'])
watch(() => props.focus, (isFocus) => {
  if (isFocus) {
    setTimeout(() => {
      ipt.value?.focus();
    }, 200)
  }
}, { immediate: true})

const handleInput = (value: string) => {
  emits('update:value', value);
}
</script>
