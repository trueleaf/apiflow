<template>
  <div class="status">
    <template v-for="(item, index) in status" :key="index">
      <div class="text-bold mt-1">{{ t(item.title) }}</div>
      <div class="px-3 d-flex flex-wrap">
        <el-tooltip v-for="(mime, index2) in item.values" :key="index2" :show-after="800" placement="top"
          :effect="Effect.LIGHT">
          <template #content>
            <div class="w-500px px-3 py-3">{{ mime.msg }}</div>
          </template>
          <div class="item" @click="handleSelect(mime.code)">{{ mime.code }}</div>
        </el-tooltip>
      </div>
    </template>
    <div class="close" @click="emits('close')">
      <el-icon>
        <Close />
      </el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Effect } from 'element-plus';
import { Close } from '@element-plus/icons-vue'
import status from './status'
import { t } from 'i18next'


const emits = defineEmits(['close', 'select']);

const handleSelect = (code: number) => {
  emits('select', code);
  emits('close');
}

</script>

<style lang='scss' scoped>
.status {
  position: relative;

  .item {
    padding: 1px 8px;
    border: 1px solid var(--gray-400);
    border-radius: 2px;
    margin-right: 10px;
    margin-top: 5px;
    margin-bottom: 10px;
    color: var(--white);
    background-color: var(--theme-color);

    &:hover {
      color: $white;
      background-color: $theme-color;
    }
  }

  .close {
    @include rt-close;
  }
}
</style>
