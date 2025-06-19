
<template>
  <span>
    <span>{{ leftStr }}</span>
    <span
      :style="{
        color: background ? '' : activeColor,
        background: isMatched && background ? activeColor : '',
      }"
    >{{ emphasizeStr }}</span>
    <span>{{ rightStr }}</span>
  </span>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  keyword: {
    type: String,
    default: '',
  },
  activeColor: {
    type: String,
    default: '#f60',
  },
  background: {
    type: Boolean,
    default: false,
  },
})

const leftStr = ref(''); //----------高亮字符串左侧字符串
const emphasizeStr = ref(''); //-----高亮字符串
const rightStr = ref(''); //---------高亮字符串右边字符串

const isMatched = computed(() => {
  return !!(props.keyword && props.value.toLowerCase().match(props.keyword.toLowerCase()));
})
const spliceStr = () => {
  const index = props.value.toLowerCase().indexOf(props.keyword.toLowerCase()); //匹配位置
  const offset = props.keyword.length; //偏移位置
  if (index === -1 || props.keyword.trim() === '') {
    leftStr.value = props.value;
    emphasizeStr.value = '';
    rightStr.value = '';
    return;
  }
  const strArr = props.value.split('');
  leftStr.value = strArr.slice(0, index).join('');
  emphasizeStr.value = strArr.slice(index, index + offset).join('');
  rightStr.value = strArr.slice(index + offset).join('');
}
watch(() => props.keyword, () => {
  spliceStr();
}, {
  immediate: true,
})
watch(() => props.value, () => {
  spliceStr();
}, {
  immediate: true,
})
</script>
