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
import { t } from 'i18next'

const slots = useSlots()
const props = defineProps({
  title: {
    type: String,
    default: t('请输入标题'),
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
    height: size(25);
    display: flex;
    align-items: center;
    ;
    user-select: none;
    color: $gray-800;
    font-size: fz(14);

    &.bold {
      font-weight: bold;
    }

    &:hover {
      background: mix($theme-color, $white, 25%);
    }
  }
}
</style>
