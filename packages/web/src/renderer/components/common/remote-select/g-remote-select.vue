<template>
  <div class="remote-select">
    <input v-model="query" v-focus-select="autoFocus" class="remote-select-inner" type="text" :placeholder="placeholder" @input="handleInput">
    <div v-if="query" class="select-panel" :class="{ 'embedded': embedded }">
      <div v-if="dataLoading" class="loading">{{ t("加载中") }}...</div>
      <div v-if="!dataLoading && !slots.default" class="empty">{{ t("暂无数据") }}</div>
      <slot v-if="!dataLoading && slots.default" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, useSlots, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { debounce } from '@/helper';

type DebounceFn = (query: string) => void;

const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入...',
  },
  remoteMethods: {
    type: Function as PropType<(query: string) => void>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: '',
  },
  autoFocus: {
    type: Boolean,
    default: false,
  },
  embedded: {
    type: Boolean,
    default: false,
  }
})
const emits = defineEmits([
  "update:modelValue",
])
const { t } = useI18n()
const slots = useSlots()
const query = ref('')
const debounceFn = ref<DebounceFn | null>(null)
const dataLoading = ref(false)

const getData = (query: string) => {
  props.remoteMethods?.(query);
}
const handleInput = () => {
  emits("update:modelValue", query.value);
}

watch(query, (val) => {
  if (val != null || val === '') {
    dataLoading.value = true;
    if (!debounceFn.value) {
      debounceFn.value = debounce<DebounceFn>((query) => {
        getData(query);
      }, 800);
    }
    debounceFn.value(val);
  }
})
watch(() => props.loading, (val) => {
  dataLoading.value = val;
})
watch(() => props.modelValue, (val) => {
  query.value = val;
})
</script>

<style lang='scss' scoped>
.remote-select {
  width: 100%;
  position: relative;

  .remote-select-inner {
    width: 100%;
    outline: 0;
    padding: 0 15px;
    height: 28px;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius-sm);
    color: var(--gray-700);
    &::-webkit-input-placeholder {
      color: var(--gray-500);
    }
  }

  .select-panel {
    position: absolute;
    left: 0;
    top: 36px;
    z-index: var(--zIndex-panel);
    overflow-y: auto;
    min-height: 40px;
    width: 100%;
    max-height: 200px;
    background: var(--white);
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius-base);
    line-height: normal;
    box-shadow: var(--box-shadow-sm);
    
    &.embedded {
      border: none;
      box-shadow: none;
      position: static;
    }
    .empty,
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      // font-size: 12px;
      color: var(--gray-500);
      padding: 10px 20px;
    }
  }
}
</style>
