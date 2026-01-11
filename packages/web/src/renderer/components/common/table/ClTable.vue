<!-- @ts-nocheck -->
<template>
  <SLoading :loading="loading">
    <el-table
      ref="table"
      v-bind="$attrs"
      :data="tableData"
      
      border
      :size="config.renderConfig.layout.size"
      :height="tableHeight"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="selection || deleteMany" type="selection" align="center" :reserve-selection="reserveSelection"></el-table-column>
      <el-table-column v-if="index" type="index" :label="t('序号')" width="60" align="center"></el-table-column>
      <slot />
    </el-table>
    <div v-if="!plain" class="d-flex j-end mt-1">
      <slot name="operation" />
      <el-button :loading="loading" type="primary" :icon="Refresh" :size="config.renderConfig.layout.size" @click="getData">{{ t("刷新") }}</el-button>
      <el-button
        v-if="deleteMany"
        :loading="loading2"
        :disabled="selectData.length === 0"
        :title="disableTip"
        type="danger"
        :icon="Delete"
        :size="config.renderConfig.layout.size"
        @click="deleteData"
      >
        {{ t("批量删除") }}
      </el-button>
      <el-pagination
        v-model:currentPage="formInfo.pageNum"
        class="ml-4"
        :layout="paging ? 'total, sizes, prev, pager, next, jumper' : 'total'"
        :total="total"
        background
        :page-sizes="[10, 20, 30, 50, 70, 100]"
        :page-size="20"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>
  </SLoading>
</template>

<script lang="ts" setup>
// @ts-nocheck
import { Delete, Refresh } from '@element-plus/icons-vue'
import { config } from '@src/config/config'
import { useI18n } from 'vue-i18n'
import SLoading from '@/components/common/loading/ClLoading.vue'
import { computed, nextTick, onMounted, ref } from 'vue';
import { debounce } from "lodash-es";
import { request } from '@/api/api';
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/clConfirm.ts';
import { useWindowEvent } from '@/hooks/useWindowEvent';


import { message } from '@/helper'
const props = defineProps({
  plain: {
    type: Boolean,
    default: false,
  },
  resHook: {
    type: Function,
    default: null
  },
  url: {
    type: String,
    required: true,
  },
  index: {
    type: Boolean,
    default: true
  },
  selection: {
    type: Boolean,
    default: false
  },
  params: {
    type: Object,
    default: () => ({}),
  },
  immediate: {
    type: Boolean,
    default: true
  },
  height: {
    type: Number,
    default: 0
  },
  deleteMany: {
    type: Boolean,
    default: false
  },
  deleteUrl: {
    type: String,
    default: ''
  },
  deleteKey: {
    type: String,
    default: 'ids'
  },
  deleteDataKey: {
    type: String,
    default: '_id'
  },
  deleteParams: {
    type: Object,
    default: () => ({}),
  },
  reserveSelection: {
    type: Boolean,
    default: false
  },
  paging: {
    type: Boolean,
    default: true
  },
})
const emits = defineEmits(['finish', 'select', 'deleteMany'])
const { t } = useI18n()
const formInfo = ref({
  pageSize: 20,
  pageNum: 1,
})
const tableData = ref([])
const tableHeight = ref('100')
const selectData = ref<Record<string, unknown>[]>([])
const total = ref(0)
const responseData = ref(null)
const loading = ref(false)
const loading2 = ref(false)
const disableTip = computed(() => {
  if (selectData.value.length === 0) {
    return t('在左侧进行数据选择后方可删除数据');
  }
  return ''
})
const table = ref<{$el: HTMLElement} | null>(null);
/*
|--------------------------------------------------------------------------
| 方法
|--------------------------------------------------------------------------
*/
const initTableHeight = () => {
  const tableDom = table.value?.$el;
  if (tableDom) {
    //hack
    setTimeout(() => {
      const { top } = tableDom.getBoundingClientRect(); //表格距离顶部距离
      const height = props.height || window.innerHeight - top - 70; //100是试出来
      tableHeight.value = height < 200 ? '200px' : `${height}px`; //高度至少200px
    })
  }
}
//获取数据
const getData = (searchParams?: unknown) => {
  return new Promise((resolve, reject) => {
    nextTick(() => {
      let p = {};
      if (Object.prototype.toString.call(searchParams).slice(8, -1) === 'Object') { //修复鼠标事件导致第一个参数数据错误
        p = JSON.parse(JSON.stringify(searchParams || {})); //防止数据变化产生递归
      }
      const params = props.paging ? Object.assign(formInfo.value, p, props.params) : Object.assign(p, props.params);
      loading.value = true;
      request.get(props.url, { params }).then((res) => {
        responseData.value = res.data;
        props.resHook?.(res, {
          tableData,
          total,
        });
        if (!props.resHook && props.paging) { //分页
          total.value = res.data.total;
          tableData.value = res.data.rows;
        } else { //不分页
          total.value = res.data.length;
          tableData.value = res.data;
        }
        resolve(res);
      }).catch((err) => {
        console.error(err);
        reject(err);
      }).finally(() => {
        loading.value = false;
        nextTick(() => {
          emits('finish', responseData, {
            tableData,
            total,
          });
        })
      });
    })
  });
}
//初始化
const debouncedInitTableHeight = debounce(() => {
  initTableHeight();
}, 300);
const init = () => {
  if (props.immediate) {
    getData();
  }
  initTableHeight();
}
useWindowEvent('resize', debouncedInitTableHeight);

// 分页
const handleSizeChange = (size: number) => {
  formInfo.value.pageNum = 1;
  formInfo.value.pageSize = size;
  getData();
}
// 改变页码
const handleCurrentChange = (page: number) => {
  formInfo.value.pageNum = page;
  getData();
}
//=========================================================================//
//选择了数据
const handleSelectionChange = (val: Record<string, unknown>[]) => {
  selectData.value = val;
  emits('select', val);
}
//批量删除
const deleteData = () => {
  ClConfirm({
    content: t('此操作将删除条记录, 是否继续?', { msg: selectData.value.length.toString() }),
    title: t('提示'),
    confirmButtonText: t('确定/ClTableDeleteMany'),
    cancelButtonText: t('取消'),
    type: 'warning'
  }).then(() => {
    const params = {} as Record<string, unknown>;
    params[props.deleteKey] = selectData.value.map((val) => val[props.deleteDataKey]);
    Object.assign(params, props.deleteParams);
    loading2.value = true;
    request.delete(props.deleteUrl, { data: params }).then(() => {
      emits('deleteMany', params.ids);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      loading2.value = false;
    });
  }).catch((err: Error | string) => {
    if (err === 'cancel' || err === 'close') {
      return;
    }
    console.error(err);
  });
}

onMounted(() => {
  init()
}) 

defineExpose({
  getData,
  tableData,
})

</script>
