<template>
  <div v-if="type === 'divider'" class="s-contextmenu-divider"></div>
  <div v-else class="s-contextmenu-item" :class="{ disabled: disabled }" @click="handleClickItem">
    <span>{{ label }}</span>
    <span class="hot-key">{{ hotKey }}</span>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  hotKey: {
    type: String,
    default: '',
  },
  type: {
    type: String as PropType<'divider' | ''>,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  }
})
const emits = defineEmits(['click'])
const handleClickItem = (e: MouseEvent) => {
  if (props.disabled) {
    return;
  }
  emits('click', e)
}

</script>

<style lang='scss' scoped>
.s-contextmenu-item {
  line-height: 1.8em;
  padding: size(5) size(25);
  cursor: pointer;
  display: flex;

  &.disabled {
    color: $gray-400;
    cursor: default;

    &:hover {
      background: inherit;
      color: $gray-400;
    }
  }

  .hot-key {
    margin-left: auto;
    color: $gray-500;
  }

  &:hover {
    background: $gray-200;
    color: $theme-color;
  }
}

.s-contextmenu-divider {
  margin: size(4) 0;
  border-top: 1px solid $gray-200;
}
</style>
