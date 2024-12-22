/*
  模块名称：配置块
  备注：
*/
<template>
  <div class="config-item">
    <div v-if="hasCheck && !slots.label">
      <el-checkbox v-model="enabled" :disabled="disabled" @change="handleEnabled">
        <span class="label">{{ label }}</span>
      </el-checkbox>
    </div>
    <div v-else-if="!hasCheck && !slots.label" class="label">
      <span v-if="required" class="required">*</span>
      <span>{{ label }}</span>
    </div>
    <div v-else-if="slots.label">
      <slot name="label" />
    </div>
    <div v-show="description" class="mt-1 description">{{ description }}</div>
    <div class="mt-2">
      <slot :enabled="enabled" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useSlots } from 'vue';

const slots = useSlots()
defineProps({
  label: { //标题信息
    type: String,
    default: '',
  },
  description: { //额外描述信息
    type: String,
    default: '',
  },
  hasCheck: { //是否显示选中
    type: Boolean,
    default: true,
  },
  disabled: { //是否禁用
    type: Boolean,
    default: false,
  },
  required: { //是否必填
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['change']);
const handleEnabled = () => {
  emits('change', enabled.value);
}
const enabled = ref(false);

</script>

<style  scoped>
.config-item {
  padding: size(10) size(20);

  &:hover {
    background: $gray-200;
  }

  .description {
    font-size: fz(12);
    color: $gray-500;
  }

  .label {
    font-weight: bolder;
    font-size: fz(15);

    .required {
      color: $red;
    }
  }
}
</style>
