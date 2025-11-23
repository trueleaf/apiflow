<template>
  <div ref="contextmenu" class="s-contextmenu" :style="{ width: width, left: left + 'px', top: realTop + 'px' }">
    <slot></slot>
  </div>
  <!-- <div class="contextmenu-shadow"></div> -->
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';


const props = defineProps({
  width: {
    type: String,
    default: '200px',
  },
  left: {
    type: Number,
    default: 0
  },
  top: {
    type: Number,
    default: 0
  },
})
const realTop = ref(0);
const contextmenu = ref<HTMLDivElement>()
watch(() => props.top, (topVal) => {
  setTimeout(() => { //保证dom加载完毕
    const { innerHeight } = window;
    const { height } = contextmenu.value!.getBoundingClientRect();
    const contextPosition = height + topVal > innerHeight ? 'top' : 'bottom';
    if (contextPosition === 'top' && height > topVal) { //显示在上面但是contextmenu高度小于上面可用空间高度
      contextmenu.value!.style.height = `${topVal}px`;
      contextmenu.value!.style.overflowY = 'auto';
    } else if (contextPosition === 'top') {
      realTop.value = topVal - height;
    } else {
      realTop.value = topVal;
    }
  }, 0)
}, {
  immediate: true
})
</script>

<style lang='scss' scoped>
.s-contextmenu {
  position: fixed;
  background: var(--white);
  box-shadow: var(--box-shadow);
  z-index: var(--zIndex-contextmenu);
  animation: ctx-fade .2s;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-400);
  }

  @keyframes ctx-fade {
    from {
      // transform: scale(0.8);
      opacity: 0;
    }

    to {
      // transform: scale(1);
      opacity: 1;
    }
  }
}

// .contextmenu-shadow {
//     position: fixed;
//     left: 0;
//     top: 0;
//     right: 0;
//     bottom: 0;
//     background: rgba(0, 0, 0, 0);
//     z-index: var(--zIndex-contextmenu - 1);
// }</style>
