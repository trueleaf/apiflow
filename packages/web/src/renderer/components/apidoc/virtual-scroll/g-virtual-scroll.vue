<template>
  <div 
    ref="containerRef" 
    class="virtual-scroll-container" 
    :class="{'is-normal': !virtual}"
    v-bind="$attrs"
    @scroll="handleScroll"
  >
    <!-- 虚拟滚动模式 -->
    <div 
      v-if="virtual"
      class="virtual-scroll-content"
      :style="{ height: `${totalHeight}px`, position: 'relative' }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.index"
        class="virtual-scroll-item"
        :style="{ 
          position: 'absolute', 
          top: `${item.top}px`, 
          width: '100%',
          height: `${itemHeight}px`
        }"
      >
        <slot :item="item.data" :index="item.index" />
      </div>
    </div>
    <!-- 普通模式 -->
    <div 
      v-else
      class="normal-scroll-content"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="normal-scroll-item"
        :style="{ height: `${itemHeight}px` }"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// 禁用自动属性继承，手动处理 class 等属性
defineOptions({
  inheritAttrs: false
});

interface VirtualScrollItem {
  index: number;
  data: any;
  top: number;
}
const props = withDefaults(defineProps<{
  items: any[];
  itemHeight: number;
  bufferSize?: number; //可见区域上下额外渲染多少个条目
  virtual?: boolean; // 是否开启虚拟滚动
}>(), {
  items: () => [],
  itemHeight: 40,
  bufferSize: 0,
  virtual: true
});

/*
|--------------------------------------------------------------------------
| 基础数据
|--------------------------------------------------------------------------
*/
const containerRef = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const containerHeight = ref(0);
const rafId = ref<number | null>(null);
const totalHeight = computed(() => props.items.length * props.itemHeight);
//实际显示item数量
const visibleCount = computed(() => {
  const height = containerHeight.value || 300;
  return Math.ceil(height / props.itemHeight) + props.bufferSize * 2;
});
// 开始索引
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize;
  return Math.max(0, index);
});
// 结束索引
const endIndex = computed(() => {
  const index = startIndex.value + visibleCount.value;
  return Math.min(props.items.length - 1, index);
});
// 可见的条目列表
const visibleItems = computed((): VirtualScrollItem[] => {
  const items: VirtualScrollItem[] = [];
  for (let i = startIndex.value; i <= endIndex.value; i++) {
    if (props.items[i] !== undefined) {
      items.push({
        index: i,
        data: props.items[i],
        top: i * props.itemHeight
      });
    }
  }
  return items;
});

/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
// 处理滚动事件 - 使用 requestAnimationFrame 节流优化
const handleScroll = (event: Event) => {
  // 只有在开启虚拟滚动时才处理滚动事件
  if (!props.virtual) {
    return;
  }
  
  if (rafId.value !== null) {
    cancelAnimationFrame(rafId.value);
  }
  // 使用 requestAnimationFrame 节流
  rafId.value = requestAnimationFrame(() => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
    rafId.value = null;
  });
};
// 更新容器高度
const updateContainerHeight = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight;
  }
};

/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  updateContainerHeight();
  window.addEventListener('resize', updateContainerHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateContainerHeight);
  // 清理未完成的 requestAnimationFrame
  if (rafId.value !== null) {
    cancelAnimationFrame(rafId.value);
    rafId.value = null;
  }
});
</script>

<style lang="scss" scoped>
.virtual-scroll-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  &.is-normal {
    height: auto;
    display: flex;
    flex-direction: column-reverse;
  }
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--fill-color-lighter, #f2f6fc);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color, #dcdfe6);
    border-radius: 4px;
    
    &:hover {
      background: var(--border-color-darker, #c4c6cf);
    }
  }
}

.virtual-scroll-content {
  position: relative;
}

.virtual-scroll-item {
  position: absolute;
  left: 0;
  right: 0;
  box-sizing: border-box;
}

.normal-scroll-content {
  position: relative;
}

.normal-scroll-item {
  box-sizing: border-box;
  flex-shrink: 0;
}
</style>
