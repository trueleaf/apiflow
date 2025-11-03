<template>
  <span class="search-highlight">
    <template v-for="(part, index) in highlightedParts" :key="index">
      <mark v-if="part.isHighlight" class="highlight-text">{{ part.text }}</mark>
      <span v-else>{{ part.text }}</span>
    </template>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
const props = defineProps<{
  text: string;
  keyword: string;
}>();
//生成高亮文本片段
const highlightedParts = computed(() => {
  if (!props.keyword || !props.text) {
    return [{ text: props.text, isHighlight: false }];
  }
  const parts: Array<{ text: string; isHighlight: boolean }> = [];
  const regex = new RegExp(`(${props.keyword})`, 'gi');
  const splitText = props.text.split(regex);
  splitText.forEach((part) => {
    if (part) {
      const isMatch = regex.test(part);
      regex.lastIndex = 0;
      parts.push({
        text: part,
        isHighlight: isMatch
      });
    }
  });
  return parts;
});
</script>

<style lang='scss' scoped>
.search-highlight {
  .highlight-text {
    background-color: #fff3cd;
    padding: 2px 4px;
    border-radius: 2px;
    font-weight: 500;
  }
}
</style>
