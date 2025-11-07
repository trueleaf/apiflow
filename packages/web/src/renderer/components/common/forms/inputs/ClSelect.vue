<template>
  <el-select :model-value="value" v-bind="$attrs" :placeholder="placeholder" :multiple="multi" filterable
    :size="config.renderConfig.layout.size" :class="className" clearable :visible-change="getSelectEnum"
    @change="handleChange">
    <el-option v-for="(item, index) in realSelectEnum" :key="index" :label="item[selectProps.name]"
      :value="item[selectProps.id] ?? ''"></el-option>
  </el-select>
</template>

<script lang="ts" setup>
import { config } from '@src/config/config'
import { request } from '@/api/api';
import { PropType, ref, watch } from 'vue';

const props = defineProps({
  value: {
    type: [String, Number],
    default: ''
  },
  multi: {
    type: Boolean,
    default: false,
  },
  selectEnum: {
    type: Array as PropType<Record<string, string | number | undefined>[]>,
    default: () => []
  },
  selectProps: {
    type: Object,
    default: () => ({
      id: 'id',
      name: 'name'
    })
  },
  url: {
    type: String,
    default: null
  },
  rawResult: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: 'w-100'
  },
  placeholder: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['change', 'update:value']);
const realSelectEnum = ref<Record<string, string | number | undefined>[]>([]);
watch(() => props.selectEnum, (val) => {
  if (val && val.length > 0) {
    realSelectEnum.value = val;
  }
}, { deep: true, immediate: true });
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//获取下拉菜单枚举值
const getSelectEnum = () => {
  request.get(props.url).then((res) => {
    realSelectEnum.value = res.data;
  }).catch((err) => {
    console.error(err);
  });
}
//数据改变
const handleChange = (val: unknown) => {
  if (props.rawResult && props.multi) { //多选返回原始数据
    emits('change', val);
    emits('update:value', val);
  } else if (!props.multi) { //单选
    if (val === '') { //如果是空字符，则返回null
      emits('change', null);
      emits('update:value', null);
    } else {
      emits('change', val);
      emits('update:value', val);
    }
  }
}
</script>
