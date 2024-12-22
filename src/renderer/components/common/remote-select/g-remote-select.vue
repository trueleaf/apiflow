<template>
  <div class="remote-select">
    <input v-model="query" class="remote-select-inner" type="text" :placeholder="placeholder" @input="handleInput">
    <div v-if="query" class="select-panel">
      <div v-if="dataLoading" class="loading">{{ t("加载中") }}...</div>
      <div v-if="!dataLoading && !slots.default" class="empty">{{ t("暂无数据") }}</div>
      <slot v-if="!dataLoading && slots.default" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, useSlots, watch } from 'vue'
import { t } from 'i18next'
import { debounce } from '@/helper';

type DebounceFn = (query: string) => void;

const props = defineProps({
  placeholder: {
    type: String,
    default: `${t('请输入')}...`,
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
})
const emits = defineEmits([
  "update:modelValue",
])
const slots = useSlots()
const query = ref('')
const debounceFn = ref<DebounceFn | null>(null)
const dataLoading = ref(false)

const getData = (query: string) => {
  if (props.remoteMethods) {
    props.remoteMethods(query);
  }
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
      });
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

<style  scoped>
.remote-select {
  width: 100%;
  position: relative;

  .remote-select-inner {
    width: 100%;
    outline: 0;
    padding: 0 size(15);
    height: size(28);
    border: 1px solid $gray-300;
    border-radius: $border-radius-sm;
    color: $gray-700;
    font-size: fz(12);

    &::-webkit-input-placeholder {
      color: $gray-500;
    }
  }

  .select-panel {
    position: absolute;
    left: 0;
    top: size(36);
    z-index: $zIndex-panel;
    overflow-y: scroll;
    // padding: size(10) size(20);
    width: 100%;
    max-height: size(200);
    background: $white;
    border: 1px solid $gray-300;
    border-radius: $border-radius-base;
    line-height: normal;
    box-shadow: $box-shadow-sm;

    .empty,
    .loading {
      font-size: fz(12);
      color: $gray-500;
      padding: size(10) size(20);
    }
  }
}
</style>
