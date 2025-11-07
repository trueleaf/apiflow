<template>
  <div class="collapse-card" :class="{ shadow: shadow }" :style="{ width: width }">
    <header v-if="slots.operation || title || slots.head" :class="{ disabled: disabled }"
      :title="disabled ? disabledTip : ''">
      <div class="head">
        <div class="control" @click="toggleCollapse">
          <template v-if="!disabled">
            <el-icon v-if="!showContent">
              <CaretRight></CaretRight>
            </el-icon>
            <el-icon v-else>
              <CaretBottom></CaretBottom>
            </el-icon>
          </template>
          <template v-else>
            <svg class="disabled-icon" aria-hidden="true">
              <use xlink:href="#iconweibiaoti-"></use>
            </svg>
          </template>
        </div>
        <div v-if="!slots.head" class="title" :title="title" :style="{ color: titleColor }">{{ title }}</div>
        <slot v-else name="head">{{ title }}</slot>
      </div>
      <div v-show="!disabled" class="operation">
        <slot name="operation"></slot>
      </div>
      <div class="tail">
        <slot name="tail"></slot>
      </div>
    </header>
    <section v-show="!disabled && showContent" ref="content" class="content">
      <slot></slot>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { CaretRight, CaretBottom } from '@element-plus/icons-vue'
import { onMounted, ref, useSlots, watch } from 'vue';

const slots = useSlots()
const props = defineProps({
  title: { // card头部标题
    type: String,
    default: '',
  },
  width: { //宽度
    type: String,
    default: '100%',
  },
  inline: {
    type: Boolean,
    default: false,
  },
  titleColor: {
    type: String,
    default: '#444',
  },
  fold: { //默认是否折叠
    type: Boolean,
    default: false,
  },
  shadow: {
    type: Boolean,
    default: false,
  },
  disabled: { //是否禁用，禁用后内容区域不显示
    type: Boolean,
    default: false,
  },
  disabledTip: {
    type: String,
    default: '',
  },
})
const emits = defineEmits<{
  change: [showContent: boolean]
}>();
const showContent = ref(true);

watch(() => props.fold, () => {
  showContent.value = !props.fold;
})
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/

const toggleCollapse = () => {
  showContent.value = !showContent.value
  emits('change', showContent.value);
}
onMounted(() => {
  showContent.value = !props.fold;
})
</script>

<style lang='scss' scoped>
.collapse-card {
  width: 100%;
  background: var(--white);
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;

  &.shadow {
    box-shadow: var(--box-shadow);
  }

  &>header {
    background: var(--gray-200);
    display: flex;
    align-items: center;
    height: 40px;

    .head {
      padding-right: 20px;
      display: flex;
      align-items: center;
      height: 100%;
      min-width: 150px;
      border-right: 1px solid var(--gray-300);

      .control {
        width: 40px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:hover {
          background: var(--gray-300);
        }
      }
    }

    .title {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      height: 40px;
      line-height: 40px;
    }

    .operation {
      flex: 1;
      padding: 0 20px;
    }

    .tail {
      padding-right: 20px;
      margin-left: auto;
    }

    &.disabled {
      cursor: not-allowed;
      background: var(--gray-100);

      .head {
        cursor: not-allowed;

        &:hover {
          background: none;
        }
      }
    }
  }

  .disabled-icon {
    width: 15px;
    height: 15px;
  }

  // 内容区域
  .content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
