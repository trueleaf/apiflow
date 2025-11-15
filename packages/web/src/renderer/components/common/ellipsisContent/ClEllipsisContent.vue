<template>
  <div class="s-ellipsis">
    <el-tooltip :effect="Effect.LIGHT" placement="top-start" :content="value.toString()" :disabled="!isOverflow">
      <div ref="textDom" class="s-ellipsis-content" @dblclick="handleSelect">{{ value }}</div>
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { Effect } from 'element-plus'

type EllipsisValue = string | number | boolean
type EllipsisProps = {
  value?: EllipsisValue
  maxWidth?: string | number
  copy?: boolean
}

const props = withDefaults(defineProps<EllipsisProps>(), {
  value: '',
  maxWidth: 100,
  copy: false
})
const isOverflow = ref(false)
const textDom = ref<HTMLElement | null>(null)

const changeValueWidth = () => {
  if (!textDom.value) {
    return
  }
  if (typeof props.maxWidth === 'number') {
    textDom.value.style.maxWidth = `${props.maxWidth}px`
  } else if (typeof props.maxWidth === 'string') {
    textDom.value.style.maxWidth = props.maxWidth
  }
}
const handleSelect = (event: Event) => {
  const selection = window.getSelection()
  selection?.removeAllRanges()
  const range = document.createRange()
  range.selectNodeContents(event.target as HTMLElement)
  selection?.addRange(range)
}

watch(() => props.value, () => {
  changeValueWidth()
  setTimeout(() => {
    if (textDom.value) {
      isOverflow.value = textDom.value.clientWidth < textDom.value.scrollWidth
    }
  })
}, {
  immediate: true
})
onMounted(() => {
  changeValueWidth()
})

</script>

<style lang='scss' scoped>
.s-ellipsis {
  display: flex;
  align-items: center;

  .s-ellipsis-content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: -3px;
    display: inline-block;
    margin-right: 10px;
  }

  .copy {
    margin-right: 10px;
  }
}
</style>
