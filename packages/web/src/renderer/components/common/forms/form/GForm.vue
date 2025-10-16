<template>
  <el-form ref="form" v-bind="$attrs" :validate-on-rule-change="false" :model="formInfo" :label-width="labelWidth" :rules="rules">
    <div v-if="config.isDev && showTips">
      {{ formInfo }}
    </div>
    <div v-if="config.isDev && showRules">
      {{ rules }}
    </div>
    <el-row>
      <slot />
    </el-row>
    <div class="d-flex a-center j-center">
      <slot name="operation" />
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { config } from '@src/config/config'
import initRules from './composables/rules'
import { forEachForest, getTextWidth } from '@/helper';
import { FormInstance } from 'element-plus';
import { onMounted, provide, ref, useSlots, VNode, watch } from 'vue';

const props = defineProps({
  editData: {
    type: Object,
    default: () => ({})
  },
  showTips: {
    type: Boolean,
    default: false,
  },
  showRules: {
    type: Boolean,
    default: false,
  },
})

const formInfo = ref<Record<string, unknown>>({});
const labelWidth = ref<string>('100px');
const form = ref<FormInstance>();
const slots = useSlots();
watch(() => props.editData, (data) => {
  Object.keys(data).forEach((key) => {
    formInfo.value[key] = data[key]
  })
}, { deep: true, immediate: true })
provide('formInfo', formInfo)

/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//初始化label的宽度
const initLabelWidth = () => {
  const formItems: VNode[] = [];
  if (slots.default) {
    const allSlots = slots.default();
    forEachForest<VNode>(allSlots, (slot: VNode) => {
      const slotType = slot.type;
      if (typeof slotType === 'object' && (slotType as Record<string, unknown>).name) {
        formItems.push(slot);
      }
    })
  }
  const labelDom = form.value?.$el.querySelector('.el-form-item__label') || document.body;
  const styleList = window.getComputedStyle(labelDom);
  const { font } = styleList;
  // eslint-disable-next-line prefer-spread
  const maxLabelWidth = Math.max.apply(Math, formItems.map((val) => {
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
      if (typeof slotType === 'object' && (slotType as Record<string, unknown>).name) {
        if (props && props.prop && !formInfo.value[props.prop]) {
          formInfo.value[props.prop] = null;
        }
      }
    })
  }
}
const validate = (fn: () => void) => {
  form.value?.validate(fn);
}

const rules = ref({});

defineExpose({
  validate,
  formInfo
})
onMounted(() => {
  initLabelWidth(); //初始化label的宽度
  initFormData(); //初始化表单数据绑定
  form.value?.resetFields();
  rules.value = initRules(slots); //初始化表单验证规则
})
</script>

