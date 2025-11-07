<template>
  <div ref="inputWrap" class="valid-input" tabindex="-1" @keydown="handleInputKeydown"
    @mouseenter="handleMouseoverWrap">
    <div class="ipt-wrap">
      <input v-show="!isShowTextarea" v-bind="$attrs" :disabled="disabled" :value="modelValue" type="textarea"
        class="ipt-inner" :class="{ error, disabled }" :placeholder="placeholder" @input="handleInput"
        @focus="handleFocus">
      <el-input v-if="isShowTextarea" ref="textarea" :disabled="disabled" :model-value="modelValue"
        class="textarea-wrap" :placeholder="placeholder" type="textarea" :size="config.renderConfig.layout.size"
        :autosize="{ minRows: 1, maxRows: 10 }" resize="none" @input="handleInput2" @blur="handleBlur"
        @focus="handleFocus2" />
    </div>
    <div v-if="error" class="ipt-error">{{ errorTip }}</div>
    <div v-if="isInput && realSelectData.length > 0" ref="mindWrap" class="mind-wrap"
      :style="{ left: focusX + 'px', top: focusY + 'px' }">
      <div v-for="(item, index) in realSelectData" :key="index" class="select-item"
        :class="{ active: currentSelectIndex === index }" @mouseover="handleMouseoverItem(index)"
        @click.stop="handleSelectItem">
        <span class="head">
          <SEmphasize :value="item.key" :keyword="modelValue"></SEmphasize>
        </span>
        <span class="tail">{{ item.type }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ApidocProperty } from '@src/types'
import SEmphasize from '@/components/common/emphasize/ClEmphasize.vue'
import { computed, nextTick, onMounted, onUnmounted, PropType, ref } from 'vue';
import { config } from '@src/config/config';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorTip: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  oneLine: {
    type: Boolean,
    default: false
  },
  selectData: {
    type: Array as PropType<ApidocProperty[]>,
    default: () => []
  },
})
const emits = defineEmits(['update:modelValue', 'remote-select', 'focus', 'blur']);
const focusX = ref(0);
const focusY = ref(0);
const isFocus = ref(false); //是否focus
const isInput = ref(false); //是否输入了数据
const isShowTextarea = ref(false); //是否显示textarea
const currentSelectIndex = ref(0);
const textarea = ref<HTMLTextAreaElement>()
const mindWrap = ref<HTMLDivElement>()
const realSelectData = computed(() => {
  if (!props.modelValue) {
    return [];
  }
  return props.selectData.filter(v => v.key.toLowerCase().includes(props.modelValue.toLowerCase()))
})

/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//键盘输入
const handleInput = (e: Event) => {
  emits('update:modelValue', (e.target as HTMLInputElement).value);
  isInput.value = true;
}
//键盘输入
const handleInput2 = (value: string) => {
  emits('update:modelValue', value);
  isInput.value = true;
}
//处理focus
const handleFocus = (e: FocusEvent) => {
  isShowTextarea.value = true;
  const iptDom = e.target as HTMLInputElement;
  const iptRect = iptDom.getBoundingClientRect();
  focusX.value = iptRect.left;
  focusY.value = iptRect.top + 30;
  const exactMatchData = props.selectData.find(v => v.key === props.modelValue);
  const hasData = props.selectData.filter(v => v.key.includes(props.modelValue));
  if (hasData && !exactMatchData) {
    isFocus.value = true;
  }
  emits('focus');
  setTimeout(() => {
    textarea.value?.focus();
  })
}
const handleFocus2 = () => {
  emits('focus');
}
//处理blur
const handleBlur = () => {
  isFocus.value = false;
  isShowTextarea.value = false;
  emits('blur')
}
//选择参数
const handleSelectItem = () => {
  const selectData = realSelectData.value[currentSelectIndex.value];
  emits('update:modelValue', selectData.key || '');
  emits('remote-select', selectData);
  isInput.value = false;
}
//处理键盘事件
const handleInputKeydown = (e: KeyboardEvent) => {
  if (e.code === 'ArrowDown') {
    e.preventDefault();
    currentSelectIndex.value = (currentSelectIndex.value + 1) % realSelectData.value.length;
    nextTick(() => {
      const activeDom = mindWrap.value?.querySelector('.select-item.active');
      if (activeDom && mindWrap.value) {
        activeDom.scrollIntoView({
          block: 'end'
        })
      }
    })
  } else if (e.code === 'ArrowUp') {
    e.preventDefault();
    let index = currentSelectIndex.value - 1;
    if (index < 0) {
      index = realSelectData.value.length - 1;
    }
    currentSelectIndex.value = index;
    nextTick(() => {
      const activeDom = mindWrap.value?.querySelector('.select-item.active');
      if (activeDom && mindWrap) {
        activeDom.scrollIntoView({
          block: 'end'
        })
      }
    })
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (realSelectData && realSelectData.value.length > 0) {
      handleSelectItem();
    }
  }
  if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
    setTimeout(() => {
      const exactMatchData = props.selectData.find(v => v.key === props.modelValue);
      if (exactMatchData) {
        emits('remote-select', exactMatchData);
      }
    })
  }
}
//鼠标移入选项默认选中当前选项
const handleMouseoverItem = (index: number) => {
  currentSelectIndex.value = index;
}
//鼠标移入整个输入框
const handleMouseoverWrap = () => {
  if (isFocus) { //只有focus了移动鼠标才会变为true
  }
}
//全局点击取消选择面板
const bindClick = () => {
  isInput.value = false;
  isFocus.value = false;
}

/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
onMounted(() => {
  document.documentElement.addEventListener('click', bindClick)
})
onUnmounted(() => {
  document.documentElement.removeEventListener('click', bindClick)
})

</script>

<style lang='scss'>
.valid-input {
  height: 45px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px;
  .ipt-wrap {
    width: 100%;
    height: 29px;
    .el-textarea__inner {
      font-size: 12px;
    }
    .ipt-inner {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      border: 1px solid var(--gray-400);
      border-radius: 4px;
      padding: 0 10px;
      font-size: 12px;
      color: var(--el-input-text-color, var(--el-text-color-regular));

      &.disabled {
        cursor: not-allowed;
        //保持与elementui样式统一
        background-color: var(--el-disabled-bg-color);
        border-color: var(--el-disabled-border-color);
        color: var(--el-disabled-text-color);
      }

      &::placeholder {
        color: var(--gray-400);
      }

      &.error {
        border: 1px solid var(--red);
      }
    }

    .textarea-wrap {
      position: absolute;
      z-index: 1;

      .el-textarea__inner {
        text-indent: -1px;
        width: 100%;
        font-size: 12px;
        color: var(--el-input-text-color, var(--el-text-color-regular));
        border-radius: 0;

        &::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--gray-500);
        }

        &::placeholder {
          color: var(--gray-400);
        }
      }
    }
  }

  .ipt-error {
    font-size: 12px;
    color: var(--red);
    line-height: 1.2;
    text-align: left;
  }

  .mind-wrap {
    top: 42px;
    left: 0;
    background: var(--white);
    z-index: var(--zIndex-contextmenu);
    position: fixed;
    min-width: 200px;
    border: 1px solid var(--gray-200);
    box-shadow: rgb(0 0 0 / 10%) 0px 2px 8px 0px; //墨刀弹窗样式
    max-height: 220px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--gray-400);
    }

    .select-item {
      line-height: 1.8em;
      padding: 5px 25px;
      cursor: pointer;
      display: flex;

      &:hover {
        background: var(--theme-color);
        color: var(--white);
      }

      &.active {
        background: var(--theme-color);
        color: var(--white);
      }

      .head {
        margin-right: 10px;
      }

      .tail {
        margin-left: auto;
      }
    }
  }
}
</style>
