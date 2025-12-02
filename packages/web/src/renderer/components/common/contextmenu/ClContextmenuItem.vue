<template>
  <div v-if="type === 'divider'" class="s-contextmenu-divider"></div>
  <div v-else class="s-contextmenu-item" :class="{ disabled: disabled }" :data-testid="`contextmenu-item-${label}`" @click="handleClickItem">
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
  padding: 5px 25px;
  cursor: pointer;
  display: flex;

  &.disabled {
    color: var(--gray-400);
    cursor: default;

    &:hover {
      background: inherit;
      color: var(--gray-400);
    }
  }

  .hot-key {
    margin-left: auto;
    color: var(--gray-500);
  }

  &:hover {
    background: var(--gray-200);
    color: var(--theme-color);
  }
}

.s-contextmenu-divider {
  margin: 4px 0;
  border-top: 1px solid var(--gray-200);
}
</style>
