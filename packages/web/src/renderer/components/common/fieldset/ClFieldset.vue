<template>
  <div class="s-fieldset">
    <div class="legend">
      <slot v-if="slots.title" name="title"></slot>
      <span v-else>{{ title }}</span>
    </div>
    <div 
      ref="contentRef"
      class="content" 
      :class="{ 'auto-height': autoHeight }"
      :style="{ 
        height: autoHeight ? 'auto' : height, 
        'maxHeight': maxHeight,
        'minHeight': autoHeight ? minHeight : undefined
      }"
    >
      <slot></slot>
    </div>
    <div class="operation">
      <slot name="operation"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots, ref, onMounted, nextTick, watch } from 'vue';

const slots = useSlots()
const contentRef = ref<HTMLElement>()

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: null,
  },
  maxHeight: {
    type: String,
    default: null,
  },
  autoHeight: {
    type: Boolean,
    default: false,
  },
  minHeight: {
    type: String,
    default: 'auto',
  },
})

/*
|--------------------------------------------------------------------------
| 变量定义
|--------------------------------------------------------------------------
*/
const contentHeight = ref<string>('auto')

/*
|--------------------------------------------------------------------------
| 初始化数据获取逻辑
|--------------------------------------------------------------------------
*/
const updateContentHeight = async () => {
  if (!props.autoHeight || !contentRef.value) {
    return
  }
  
  await nextTick()
  
  // 获取内容的实际高度
  const contentElement = contentRef.value
  const scrollHeight = contentElement.scrollHeight
  
  // 如果内容高度超过最大高度,则使用最大高度
  if (props.maxHeight) {
    const maxHeightValue = parseInt(props.maxHeight)
    if (scrollHeight > maxHeightValue) {
      contentHeight.value = props.maxHeight
      contentElement.style.overflowY = 'auto'
    } else {
      contentHeight.value = `${scrollHeight}px`
      contentElement.style.overflowY = 'visible'
    }
  } else {
    contentHeight.value = `${scrollHeight}px`
    contentElement.style.overflowY = 'visible'
  }
}

/*
|--------------------------------------------------------------------------
| 逻辑处理函数
|--------------------------------------------------------------------------
*/
const handleContentChange = () => {
  if (props.autoHeight) {
    updateContentHeight()
  }
}

/*
|--------------------------------------------------------------------------
| 生命周期函数
|--------------------------------------------------------------------------
*/
onMounted(() => {
  if (props.autoHeight) {
    updateContentHeight()
    
    // 监听内容变化
    const observer = new MutationObserver(() => {
      handleContentChange()
    })
    
    if (contentRef.value) {
      observer.observe(contentRef.value, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      })
    }
  }
})

watch(() => props.autoHeight, (newVal) => {
  if (newVal) {
    updateContentHeight()
  }
})

watch(() => props.maxHeight, () => {
  if (props.autoHeight) {
    updateContentHeight()
  }
})
</script>

<style lang='scss' scoped>
.s-fieldset {
  display: block;
  min-height: 30px;
  position: relative;
  border: 1px solid var(--gray-500);
  margin-top: 20px;
  background: inherit;

  &>.legend {
    position: absolute;
    height: 30px;
    left: 20px;
    top: -10px;
    color: var(--gray-700);
    background: var(--bg-primary);
    padding: 0 20px;
    font-size: 18px;
    font-weight: bolder;
    z-index: var(--zIndex-fieldset);
  }

  &>.content {
    padding: 10px;
    width: 100%;
    padding-top: 25px;
    overflow-y: auto;
    transition: height 0.3s ease;
    
    &.auto-height {
      overflow-y: visible;
    }
  }
}
</style>
