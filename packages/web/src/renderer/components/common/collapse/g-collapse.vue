/*
模块名称：折叠面板
备注：
*/
<template>
  <div class="s-collaps mb-1">
    <div class="header" :class="{ bold: bold }" @click="toggleCollapse">
      <span v-if="!disabled" class="gray-700">
        <el-icon v-if="isActive" :size="16">
          <arrow-down />
        </el-icon>
        <el-icon v-else :size="16">
          <arrow-right />
        </el-icon>
      </span>
      <span v-if="!slots.title" class="ml-1">{{ title }}</span>
      <slot v-else name="title" />
    </div>
    <div v-show="isActive" :class="noPaddingX ? 'pr-2 gray-700' : 'pr-2 pl-5 gray-700'">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, useSlots, watch } from 'vue'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import { useTranslation } from 'i18next-vue'

const slots = useSlots()
const { t } = useTranslation()
const props = defineProps({
  title: {
    type: String,
    default: '请输入标题',
  },
  bold: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  noPaddingX: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const isActive = ref(false);
const cancelWatch = watch(() => isActive.value, () => {
  isActive.value = props.active;
}, {
  immediate: true,
})

const toggleCollapse = () => {
  if (props.disabled) {
    return;
  }
  if (cancelWatch) {
    cancelWatch();
  }
  isActive.value = !isActive.value
}
</script>

<style lang='scss' scoped>
.s-collaps {
  &>.header {
    cursor: pointer;
    height: 25px;
    display: flex;
    align-items: center;
    user-select: none;
    color: var(--gray-800);
    font-size: 14px;

    &.bold {
      font-weight: bold;
    }

    &:hover {
      background: var(--gray-200);
    }
  }
}
</style>
