<template>
  <SCard class="s-search">
    <div v-if="config.isDev && showTip">
      {{ formInfo }}
    </div>
    <!-- 内容区域 -->
    <el-form ref="form" :label-width="labelWidth">
      <el-row>
        <slot />
      </el-row>
    </el-form>
    <template #operation>
      <div class="d-flex a-center">
        <el-button :size="config.renderConfig.layout.size" type="primary" :disabled="loading"
          @click="handleSearch">搜索</el-button>
        <el-button :size="config.renderConfig.layout.size" type="warning" :disabled="loading"
          @click="handleReset">重置</el-button>
        <!-- <el-button v-show="couldShowLoadMore" :size="config.renderConfig.layout.size" type="primary" :disabled="loading"
          @click="toggleExpand">
          <span v-if="isFold">更多筛选</span>
          <span v-else>折叠筛选</span>
        </el-button> -->
        <slot name="operation" />
      </div>
    </template>
  </SCard>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, provide, ref, useSlots, VNode, watch } from 'vue'
import { config } from '@/../config/config'
import { FormInstance } from 'element-plus';
import { forEachForest, getTextWidth, event } from '@/helper';
import SCard from '@/components/common/card/g-card.vue'

const props = defineProps({
  editData: {
    type: Object,
    default: () => ({}),
  },
  showTip: {
    type: Boolean,
    default: false,
  },
  autoRequest: {
    type: Boolean,
    default: false
  },
  foldedHeight: {
    type: Number,
    default: 50,
  },
})
const emits = defineEmits(['search', 'reset', 'change'])
const formInfo = ref<Record<string, unknown>>({});
const originFormInfo = ref<Record<string, unknown>>({});
const loading = ref(false);
const labelWidth = ref('100px');
const form = ref<FormInstance>();
const slots = useSlots();

watch(() => props.editData, (data) => {
  Object.keys(data).forEach((key) => {
    formInfo.value[key] = data[key]
  });
}, { deep: true, immediate: true })

/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//处理change事件
const handleChangeEvent = () => {
  nextTick(() => {
    emits('change', formInfo.value);
  });
}
//初始化label的宽度
const initLabelWidth = () => {
  const searchItems: VNode[] = [];
  if (slots.default) {
    const allSlots = slots.default();
    forEachForest<VNode>(allSlots, (slot: VNode) => {
      const slotType = slot.type;
      if (typeof slotType === 'object' && (slotType as Record<string, unknown>).name) {
        searchItems.push(slot);
      }
    })
  }

  const labelDom = form.value?.$el.querySelector('.el-form-item__label') || document.body;
  const styleList = window.getComputedStyle(labelDom);
  const { font } = styleList;
  // eslint-disable-next-line prefer-spread
  const maxLabelWidth = Math.max.apply(Math, searchItems.map((val) => {
    const { props } = val;
    const label: string = props ? (props.label || '') : '';
    const labelWidth = getTextWidth(label, font)
    return labelWidth;
  }));
  const realWidth = maxLabelWidth < 100 ? 100 : maxLabelWidth;
  labelWidth.value = `${Math.ceil(realWidth)}px`
}
//初始化表单参数
const initFormData = () => {
  if (slots.default) {
    const allSlots = slots.default();
    forEachForest<VNode>(allSlots, (slot: VNode) => {
      const slotType = slot.type;
      const { props } = slot;
      if (typeof slotType === 'object' && (slotType as Record<string, unknown>).__name === 'g-search-item') {
        if (props && props.prop) {
          formInfo.value[props.prop] = null;
        }
      }
    })
    originFormInfo.value = JSON.parse(JSON.stringify(formInfo.value));
  }
}

//触发搜索事件
const handleSearch = () => {
  emits('change', formInfo.value);
  emits('search', formInfo.value);
}
//触发重置事件
const handleReset = () => {
  Object.assign(formInfo.value, originFormInfo.value);
  emits('change', formInfo.value);
  emits('reset');
}
provide('formInfo', formInfo.value);
onMounted(() => {
  initLabelWidth(); //初始化label的宽度
  initFormData(); //初始化表单数据绑定
  // checkFormHeight(); //检查是否显示折叠按钮
  event.on('searchItem/change', handleChangeEvent);
})
onUnmounted(() => {
  event.off('searchItem/change', handleChangeEvent)
})

</script>

<style  scoped>
.s-search {
  .el-form-item {
    margin-bottom: size(10);
  }
}
</style>
